from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schema.user import UserCreate, UserResponse
from app.models.user import User, UserRole
from app.core.auth import get_password_hash, check_role, get_current_user

router = APIRouter()

@router.post("/create-user", response_model=UserResponse)
async def create_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role([UserRole.ADMIN]))
):
    db_user = db.query(User).filter(User.username == user_in.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        hashed_password=hashed_password,
        role=user_in.role,
        shop_name=user_in.shop_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
