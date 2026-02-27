from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
from app.core import config

SECRET_KEY = getattr(config, "SECRET_KEY", "SUPER_SECRET_HRMS_KEY_2026")
if not SECRET_KEY:
    SECRET_KEY = "SUPER_SECRET_HRMS_KEY_2026"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_temp_session_token(user_id: int):
    # Temporary token for facial verification step (shorter expiry)
    expire = datetime.utcnow() + timedelta(minutes=10)
    to_encode = {"user_id": user_id, "exp": expire, "type": "facial_verification"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
