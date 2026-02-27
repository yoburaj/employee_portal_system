from fastapi import APIRouter

# HRMS Routers
from app.api.v1.auth.hrms_auth import router as hrms_auth_router
from app.api.v1.employees.hrms_employees import router as hrms_employee_router
from app.api.v1.admin.hrms_admin import router as hrms_admin_router
from app.api.v1.dashboard.hrms_dashboard import router as hrms_dashboard_router

router = APIRouter(prefix="/api/v1")

# HRMS Routes (Primary)
router.include_router(hrms_auth_router)
router.include_router(hrms_employee_router)
router.include_router(hrms_admin_router)
router.include_router(hrms_dashboard_router)
