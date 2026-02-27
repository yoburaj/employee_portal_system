from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class AuthenticationLog(Base):
    __tablename__ = "authentication_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    login_attempt_time = Column(DateTime(timezone=True), server_default=func.now())
    login_status = Column(String(20), nullable=False) # success, failed, unauthorized
    failure_reason = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String, nullable=True)
    facial_verification_status = Column(String(20), nullable=True) # passed, failed, skipped
    facial_confidence = Column(Numeric(5, 2), nullable=True)

    # Relationships
    user = relationship("User", back_populates="auth_logs")

    def __repr__(self):
        return f"<AuthenticationLog(user_id={self.user_id}, status='{self.login_status}', facial='{self.facial_verification_status}')>"
