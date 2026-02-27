from sqlalchemy import Column, Integer, ForeignKey
from app.database.database import Base

class VegetableUsage(Base):
    __tablename__ = "vegetable_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vegetable_id = Column(Integer, ForeignKey("vegetables.id"))
    usage_count = Column(Integer, default=0)
