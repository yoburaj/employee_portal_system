from sqlalchemy import text
from app.database.database import engine, Base
from app.models import *

def reset_db_cascade():
    with engine.connect() as conn:
        print("Dropping all tables with CASCADE...")
        # Get all table names
        result = conn.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"))
        tables = result.fetchall()
        for table in tables:
            print(f"Dropping table {table[0]} CASCADE")
            conn.execute(text(f"DROP TABLE IF EXISTS {table[0]} CASCADE"))
        conn.commit()
    
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset successfully")

if __name__ == "__main__":
    reset_db_cascade()
