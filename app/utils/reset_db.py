from app.database.database import Base, engine
from app.models import * # Import all models to ensure they are registered

def reset_database():
    print("Reseting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset successfully")

if __name__ == "__main__":
    reset_database()
