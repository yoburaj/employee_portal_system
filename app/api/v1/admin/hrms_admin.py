from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.skill import Skill
from app.models.auth_log import AuthenticationLog
from app.models.admin_department_access import AdminDepartmentAccess
from app.schema.user import DepartmentCreate, DepartmentResponse, SkillCreate, SkillResponse, AuthLogResponse
from app.api.v1.auth.dependencies import get_current_user, check_role
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/admin", tags=["HRMS Admin Operations"])

# --- Department Management ---

@router.post("/departments", response_model=DepartmentResponse)
def create_department(
    dept_in: DepartmentCreate,
    current_user: User = Depends(check_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    if db.query(Department).filter(Department.name == dept_in.name).first():
        raise HTTPException(status_code=400, detail="Department already exists")
    
    dept = Department(**dept_in.dict())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(
    db: Session = Depends(get_db)
):
    return db.query(Department).all()

@router.post("/departments/{department_id}/assign-admin")
def assign_admin_to_dept(
    department_id: int,
    admin_user_id: int,
    current_user: User = Depends(check_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    # Check if user is an admin
    user = db.query(User).filter(User.id == admin_user_id).first()
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="User is not an Admin")
    
    # Check dept
    if not db.query(Department).filter(Department.id == department_id).first():
        raise HTTPException(status_code=404, detail="Department not found")

    access = AdminDepartmentAccess(
        admin_user_id=admin_user_id,
        department_id=department_id,
        granted_by=current_user.id
    )
    db.add(access)
    db.commit()
    return {"status": "success", "message": "Admin assigned to department"}

# --- Skill Management ---

@router.post("/skills", response_model=SkillResponse)
def create_skill(
    skill_in: SkillCreate,
    current_user: User = Depends(check_role([UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    if db.query(Skill).filter(Skill.name == skill_in.name).first():
        raise HTTPException(status_code=400, detail="Skill already exists")
    
    skill = Skill(**skill_in.dict())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.get("/skills", response_model=List[SkillResponse])
def list_skills(
    db: Session = Depends(get_db)
):
    return db.query(Skill).all()

# --- Audit Logs ---

@router.get("/auth-logs", response_model=List[AuthLogResponse])
def get_auth_logs(
    user_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuthenticationLog).options(joinedload(AuthenticationLog.user))

    if current_user.role == UserRole.EMPLOYEE:
        # Employees can only see their own logs
        query = query.filter(AuthenticationLog.user_id == current_user.id)
    elif current_user.role == UserRole.ADMIN:
        # Admins can see logs for their department employees
        allowed_dept_ids = [a.department_id for a in current_user.admin_department_access]
        # This requires joining with User and EmployeeProfile
        from app.models.employee_profile import EmployeeProfile
        query = query.join(User).join(EmployeeProfile).filter(EmployeeProfile.department_id.in_(allowed_dept_ids))
    
    if user_id and current_user.role != UserRole.EMPLOYEE:
        query = query.filter(AuthenticationLog.user_id == user_id)
    
    if status:
        query = query.filter(AuthenticationLog.login_status == status)
    
    return query.order_by(AuthenticationLog.login_attempt_time.desc()).limit(100).all()
