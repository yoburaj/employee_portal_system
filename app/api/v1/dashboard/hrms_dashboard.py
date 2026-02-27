from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.skill import Skill
from app.api.v1.auth.dependencies import get_current_user, check_role

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(check_role([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    total_employees = db.query(User).filter(User.role == UserRole.EMPLOYEE).count()
    total_departments = db.query(Department).count()
    total_skills = db.query(Skill).count()
    
    # Simple active users count (users logged in last 24 hours)
    from datetime import datetime, timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    active_users = db.query(User).filter(User.last_login >= yesterday).count()

    return {
        "status": "success",
        "data": {
            "total_employees": total_employees,
            "total_departments": total_departments,
            "total_skills": total_skills,
            "active_users": active_users
        }
    }
