from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class EmployeeDocument(Base):
    __tablename__ = "employee_documents"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employee_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(255), nullable=False)
    document_type = Column(String(50), nullable=True) # e.g., 'Offer Letter', 'Contract', etc.
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employee = relationship("EmployeeProfile", back_populates="documents")

    def __repr__(self):
        return f"<EmployeeDocument(id={self.id}, name='{self.document_name}')>"
