from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.employee_profile import EmployeeProfile
from app.models.employee_skill import EmployeeSkill
from app.models.facial_recognition import FacialRecognitionData
from app.models.auth_log import AuthenticationLog
from app.schema.user import UserCreate, UserResponse, LoginRequest, LoginResponse, FacialVerifyRequest
from app.utils.password_handler import get_password_hash, verify_password
from app.utils.jwt_handler import create_temp_session_token, create_access_token, verify_token
from app.services.facial_service import facial_service

router = APIRouter(prefix="/auth", tags=["HRMS Authentication"])

@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Starting signup for user: {user_in.username}")
    # Check if user already exists
    if db.query(User).filter(User.username == user_in.username).first():
        print("DEBUG: Username already exists")
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == user_in.email).first():
        print("DEBUG: Email already exists")
        raise HTTPException(status_code=400, detail="Email already exists")

    try:
        # Create user record
        db_user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=user_in.role
        )
        db.add(db_user)
        db.flush() # Get user ID
        print(f"DEBUG: Created user with ID: {db_user.id}")

        # Create employee profile
        profile = EmployeeProfile(
            user_id=db_user.id,
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            department_id=user_in.department_id,
            employee_id=f"EMP{db_user.id:04d}"
        )
        db.add(profile)
        db.flush()
        print(f"DEBUG: Created profile with ID: {profile.id}")

        # Add skills if provided
        if user_in.skills:
            for skill_in in user_in.skills:
                emp_skill = EmployeeSkill(
                    employee_id=profile.id,
                    skill_id=skill_in.skill_id,
                    proficiency_level=skill_in.proficiency_level,
                    years_of_experience=skill_in.years_of_experience
                )
                db.add(emp_skill)
            print("DEBUG: Added skills")

        # Initialize facial data record (not yet enrolled)
        facial_data = FacialRecognitionData(user_id=db_user.id, is_enrolled=False)
        db.add(facial_data)

        db.commit()
        
        # Reload with relationships for schema validation
        from sqlalchemy.orm import joinedload
        final_user = db.query(User).options(
            joinedload(User.employee_profile).joinedload(EmployeeProfile.department),
            joinedload(User.employee_profile).joinedload(EmployeeProfile.skills),
            joinedload(User.facial_data)
        ).filter(User.id == db_user.id).first()

        print("DEBUG: Signup completed successfully")
        return final_user
    except Exception as e:
        print(f"DEBUG ERROR in signup: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise e

@router.post("/facial-enroll")
def facial_enroll(
    user_id: int = Form(...),
    face_images: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        # Generate average embedding from uploaded files using DeepFace ArcFace
        avg_embedding = facial_service.generate_enrollment_embedding(face_images)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Save to database
    facial_data = db.query(FacialRecognitionData).filter(FacialRecognitionData.user_id == user_id).first()
    if facial_data:
        facial_data.is_enrolled = True
        facial_data.face_embedding = json.dumps(avg_embedding)
        db.commit()
    else:
        new_facial_data = FacialRecognitionData(
            user_id=user_id,
            is_enrolled=True,
            face_embedding=json.dumps(avg_embedding)
        )
        db.add(new_facial_data)
        db.commit()

    return {"status": "success", "message": "Enrolled face embedding successfully"}

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Log failure
        log = AuthenticationLog(
            user_id=user.id if user else None,
            login_status="failed",
            failure_reason="Invalid credentials"
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Determine if facial recognition is required
    requires_facial = True
    if user.role == UserRole.SUPER_ADMIN:
        requires_facial = False
    elif not user.facial_data or not user.facial_data.is_enrolled:
        requires_facial = False

    # If facial recognition is NOT required, log in directly
    if not requires_facial:
        access_token = create_access_token(data={"sub": user.username, "role": user.role, "user_id": user.id})
        user.last_login = datetime.utcnow()
        db.commit()
        return {
            "status": "authorized",
            "message": "Login successful",
            "data": {
                "user_id": user.id,
                "username": user.username,
                "role": user.role,
                "access_token": access_token,
                "token_type": "bearer",
                "requires_facial_verification": False
            }
        }

    # If other role, generate temporary session token for facial verification step
    temp_token = create_temp_session_token(user.id)
    
    return {
        "status": "credentials_verified",
        "message": "Please perform facial verification",
        "data": {
            "user_id": user.id,
            "requires_facial_verification": True,
            "session_token": temp_token
        }
    }

@router.post("/verify-face")
def verify_face(
    session_token: str = Form(...),
    face_image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    payload = verify_token(session_token)
    if not payload or payload.get("type") != "facial_verification":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.facial_data or not user.facial_data.face_embedding:
        raise HTTPException(status_code=400, detail="User has no registered face data")

    # Verify face using the stored embedding
    is_match, confidence = facial_service.verify_face(face_image, user.facial_data.face_embedding)
    
    # Log the attempt
    log = AuthenticationLog(
        user_id=user_id,
        login_status="success" if is_match else "unauthorized",
        facial_verification_status="passed" if is_match else "failed",
        facial_confidence=confidence,
        failure_reason=None if is_match else "Face mismatch"
    )
    db.add(log)

    if not is_match:
        db.commit()
        raise HTTPException(status_code=401, detail="Unknown user - Facial recognition failed")

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Generate final JWT access token
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "user_id": user.id})
    
    return {
        "status": "authorized",
        "message": "Login successful",
        "data": {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "access_token": access_token,
            "token_type": "bearer"
        }
    }
