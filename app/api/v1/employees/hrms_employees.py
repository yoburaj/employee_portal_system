from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.employee_profile import EmployeeProfile
from app.models.employee_skill import EmployeeSkill
from app.models.employee_document import EmployeeDocument
from app.models.admin_department_access import AdminDepartmentAccess
from app.schema.user import EmployeeProfileResponse, EmployeeProfileUpdate, UserCreate
from app.api.v1.auth.dependencies import get_current_user, check_role
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/employees", tags=["HRMS Employees"])

@router.get("/me", response_model=EmployeeProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(EmployeeProfile)\
        .options(joinedload(EmployeeProfile.department), joinedload(EmployeeProfile.skills).joinedload(EmployeeSkill.skill), joinedload(EmployeeProfile.documents))\
        .filter(EmployeeProfile.user_id == current_user.id)\
        .first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("", response_model=List[EmployeeProfileResponse])
def list_employees(
    department_id: Optional[int] = Query(None),
    skill_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(EmployeeProfile).options(
        joinedload(EmployeeProfile.user).joinedload(User.facial_data), 
        joinedload(EmployeeProfile.department), 
        joinedload(EmployeeProfile.skills).joinedload(EmployeeSkill.skill)
    )

    # RBAC filtering
    if current_user.role == UserRole.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Lack of permissions")
    
    if current_user.role == UserRole.ADMIN:
        # Admin can only see employees in their assigned departments
        allowed_dept_ids = [a.department_id for a in current_user.admin_department_access]
        if department_id:
            if department_id not in allowed_dept_ids:
                raise HTTPException(status_code=403, detail="You do not have access to this department")
            query = query.filter(EmployeeProfile.department_id == department_id)
        else:
            query = query.filter(EmployeeProfile.department_id.in_(allowed_dept_ids))
    elif current_user.role == UserRole.SUPER_ADMIN:
        # Super Admin can see all
        if department_id:
            query = query.filter(EmployeeProfile.department_id == department_id)

    # Skill filtering
    if skill_id:
        query = query.join(EmployeeSkill).filter(EmployeeSkill.skill_id == skill_id)

    return query.all()

@router.post("", response_model=EmployeeProfileResponse)
def create_employee(
    user_in: UserCreate,
    current_user: User = Depends(check_role([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    # Check if user exists
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    from app.utils.password_handler import get_password_hash
    import uuid

    # 1. Create User
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.flush()

    # 2. Create Profile
    employee_id = f"EMP-{str(uuid.uuid4())[:8].upper()}"
    profile = EmployeeProfile(
        user_id=user.id,
        employee_id=employee_id,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        department_id=user_in.department_id
    )
    db.add(profile)
    db.flush()

    # 3. Add Skills
    if user_in.skills:
        for skill_in in user_in.skills:
            emp_skill = EmployeeSkill(
                employee_id=profile.id,
                skill_id=skill_in.skill_id,
                proficiency_level=skill_in.proficiency_level,
                years_of_experience=skill_in.years_of_experience
            )
            db.add(emp_skill)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/{employee_id}", response_model=EmployeeProfileResponse)
def get_employee(
    employee_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(EmployeeProfile).options(
        joinedload(EmployeeProfile.user).joinedload(User.facial_data), 
        joinedload(EmployeeProfile.department), 
        joinedload(EmployeeProfile.skills).joinedload(EmployeeSkill.skill)
    ).filter(EmployeeProfile.employee_id == employee_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee not found")

    # RBAC check
    if current_user.role == UserRole.EMPLOYEE and current_user.id != profile.user_id:
         raise HTTPException(status_code=403, detail="Cannot view other profiles")
    
    if current_user.role == UserRole.ADMIN:
        allowed_dept_ids = [a.department_id for a in current_user.admin_department_access]
        if profile.department_id not in allowed_dept_ids:
            raise HTTPException(status_code=403, detail="No access to this department")

    return profile

@router.put("/me", response_model=EmployeeProfileResponse)
def update_profile(
    profile_in: EmployeeProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.employee_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_in.dict(exclude_unset=True)

    if "email" in update_data:
        new_email = update_data.pop("email")
        if profile.user:
            existing_user = db.query(User).filter(User.email == new_email).first()
            if existing_user and existing_user.id != profile.user_id:
                raise HTTPException(status_code=400, detail="Email already exists")
            profile.user.email = new_email

    if "skills" in update_data:
        # Update skills logic (simpler: replace all for now or append)
        db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == profile.id).delete()
        for skill_in in profile_in.skills:
            emp_skill = EmployeeSkill(
                employee_id=profile.id,
                skill_id=skill_in.skill_id,
                proficiency_level=skill_in.proficiency_level,
                years_of_experience=skill_in.years_of_experience
            )
            db.add(emp_skill)
        del update_data["skills"]

    for key, value in update_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/{employee_id}", response_model=EmployeeProfileResponse)
def update_employee(
    employee_id: str,
    profile_in: EmployeeProfileUpdate,
    current_user: User = Depends(check_role([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee not found")

    # RBAC check for Admin
    if current_user.role == UserRole.ADMIN:
        allowed_dept_ids = [a.department_id for a in current_user.admin_department_access]
        if profile.department_id not in allowed_dept_ids:
            raise HTTPException(status_code=403, detail="No access to this department")

    update_data = profile_in.dict(exclude_unset=True)
    
    if "email" in update_data:
        new_email = update_data.pop("email")
        if profile.user:
            # Check if email is already taken by another user
            existing_user = db.query(User).filter(User.email == new_email).first()
            if existing_user and existing_user.id != profile.user_id:
                raise HTTPException(status_code=400, detail="Email already exists")
            profile.user.email = new_email

    if "skills" in update_data:
        db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == profile.id).delete()
        for skill_in in profile_in.skills:
            emp_skill = EmployeeSkill(
                employee_id=profile.id,
                skill_id=skill_in.skill_id,
                proficiency_level=skill_in.proficiency_level,
                years_of_experience=skill_in.years_of_experience
            )
            db.add(emp_skill)
        del update_data["skills"]

    for key, value in update_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/{employee_id}")
def delete_employee(
    employee_id: str,
    current_user: User = Depends(check_role([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee not found")

    # RBAC check for Admin
    if current_user.role == UserRole.ADMIN:
        allowed_dept_ids = [a.department_id for a in current_user.admin_department_access]
        if profile.department_id not in allowed_dept_ids:
            raise HTTPException(status_code=403, detail="No access to this department")

    # Delete User (cascades to Profile if set up, but let's be explicit)
    user = profile.user
    db.delete(profile)
    if user:
        db.delete(user)
    
    db.commit()
    return {"status": "success", "message": f"Employee {employee_id} deleted"}

from fastapi import File, UploadFile
import shutil
import os
import uuid

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.employee_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Ensure directory exists
    os.makedirs("uploads/profile_pictures", exist_ok=True)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = f"uploads/profile_pictures/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update profile
    profile.profile_picture = f"/uploads/profile_pictures/{filename}"
    db.commit()
    db.refresh(profile)

    return {"url": profile.profile_picture}

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = "General",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.employee_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    os.makedirs("uploads/documents", exist_ok=True)
    
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = f"uploads/documents/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    new_doc = EmployeeDocument(
        employee_id=profile.id,
        document_name=file.filename,
        document_type=document_type,
        file_path=f"/{file_path}",
        file_size_bytes=file_size
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    from app.schema.user import EmployeeDocumentResponse
    return EmployeeDocumentResponse.from_orm(new_doc)
