from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class FacialRecognitionData(Base):
    __tablename__ = "facial_recognition_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    face_encoding_path = Column(String(500), nullable=True)  # Path to stored dataset/encodings
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    last_verified = Column(DateTime(timezone=True), nullable=True)
    verification_count = Column(Integer, default=0)
    is_enrolled = Column(Boolean, default=True)
    confidence_threshold = Column(Numeric(5, 2), default=50.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="facial_data")

    def __repr__(self):
        return f"<FacialRecognitionData(user_id={self.user_id}, is_enrolled={self.is_enrolled})>"
