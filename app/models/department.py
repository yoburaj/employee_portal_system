from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employees = relationship("EmployeeProfile", back_populates="department")
    admin_access = relationship("AdminDepartmentAccess", back_populates="department", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}')>"
