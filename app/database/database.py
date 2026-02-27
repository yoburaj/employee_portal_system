from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core import config

DATABASE_URL = (
    f"{config.DB_DRIVER}://{config.DB_USER}:"
    f"{config.DB_PASSWORD}@{config.DB_HOST}:"
    f"{config.DB_PORT}/{config.DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
