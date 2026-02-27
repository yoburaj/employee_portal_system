from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EMPLOYEE = "employee"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        Enum(UserRole, values_callable=lambda x: [e.value for e in x]), 
        default=UserRole.EMPLOYEE,
        nullable=False
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    employee_profile = relationship("EmployeeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="EmployeeProfile.user_id")
    facial_data = relationship("FacialRecognitionData", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_department_access = relationship("AdminDepartmentAccess", back_populates="admin_user", cascade="all, delete-orphan", foreign_keys="AdminDepartmentAccess.admin_user_id")
    auth_logs = relationship("AuthenticationLog", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
