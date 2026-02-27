from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Numeric, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.database import Base

class ProficiencyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class EmployeeSkill(Base):
    __tablename__ = "employee_skills"
    __table_args__ = (
        UniqueConstraint('employee_id', 'skill_id', name='unique_employee_skill'),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employee_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency_level = Column(
        Enum(ProficiencyLevel, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    years_of_experience = Column(Numeric(3, 1), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employee = relationship("EmployeeProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="employee_skills")

    def __repr__(self):
        return f"<EmployeeSkill(employee_id={self.employee_id}, skill_id={self.skill_id}, level='{self.proficiency_level}')>"
