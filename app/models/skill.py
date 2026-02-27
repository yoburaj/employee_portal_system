from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employee_skills = relationship("EmployeeSkill", back_populates="skill", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Skill(id={self.id}, name='{self.name}', category='{self.category}')>"
