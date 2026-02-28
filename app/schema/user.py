from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from app.models.user import UserRole
from app.models.employee_skill import ProficiencyLevel

# --- Skill Schemas ---
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

# --- Employee Skill Schemas ---
class EmployeeSkillCreate(BaseModel):
    skill_id: int
    proficiency_level: ProficiencyLevel
    years_of_experience: Optional[float] = None

class EmployeeSkillResponse(BaseModel):
    skill: SkillResponse
    proficiency_level: ProficiencyLevel
    years_of_experience: Optional[float]

    class Config:
        from_attributes = True

class FacialRecognitionResponse(BaseModel):
    is_enrolled: bool
    last_verified: Optional[datetime] = None
    enrollment_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserSummaryResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    facial_data: Optional[FacialRecognitionResponse] = None

    class Config:
        from_attributes = True

# --- Document Schemas ---
class EmployeeDocumentResponse(BaseModel):
    id: int
    document_name: str
    document_type: Optional[str] = None
    file_path: str
    file_size_bytes: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- Profile Schemas ---
class EmployeeProfileBase(BaseModel):
    first_name: str
    last_name: str
    job_title: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    profile_picture: Optional[str] = None

class EmployeeProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    job_title: Optional[str] = None
    phone_number: Optional[str] = None
    department_id: Optional[int] = None
    hire_date: Optional[date] = None
    date_of_birth: Optional[date] = None
    profile_picture: Optional[str] = None
    skills: Optional[List[EmployeeSkillCreate]] = None

class EmployeeProfileResponse(EmployeeProfileBase):
    id: int
    employee_id: Optional[str] = None
    department: Optional[DepartmentResponse] = None
    skills: List[EmployeeSkillResponse] = []
    documents: List[EmployeeDocumentResponse] = []
    hire_date: Optional[date]
    user: Optional[UserSummaryResponse] = None

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str
    department_id: Optional[int] = None
    skills: Optional[List[EmployeeSkillCreate]] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    employee_profile: Optional[EmployeeProfileResponse]

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int

# --- Auth Log Schemas ---
class UserMinResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class AuthLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    login_attempt_time: datetime
    login_status: str
    failure_reason: Optional[str]
    facial_verification_status: Optional[str]
    facial_confidence: Optional[float]
    user: Optional[UserMinResponse]

    class Config:
        from_attributes = True

class FacialVerifyRequest(BaseModel):
    session_token: str
