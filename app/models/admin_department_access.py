from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class AdminDepartmentAccess(Base):
    __tablename__ = "admin_department_access"
    __table_args__ = (
        UniqueConstraint('admin_user_id', 'department_id', name='unique_admin_dept_access'),
    )

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    granted_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    admin_user = relationship("User", back_populates="admin_department_access", foreign_keys=[admin_user_id])
    department = relationship("Department", back_populates="admin_access")

    def __repr__(self):
        return f"<AdminDepartmentAccess(admin_id={self.admin_user_id}, dept_id={self.department_id})>"
