from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    phone_number = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    hire_date = Column(Date, nullable=True)
    job_title = Column(String(100), nullable=True)
    employee_id = Column(String(50), unique=True, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="employee_profile", foreign_keys=[user_id])
    department = relationship("Department", back_populates="employees")
    manager = relationship("User", foreign_keys=[manager_id])
    skills = relationship("EmployeeSkill", back_populates="employee", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<EmployeeProfile(id={self.id}, name='{self.full_name}', employee_id='{self.employee_id}')>"
