from sqlalchemy import text
from app.database.database import engine, Base
from app.models import *

def reset_db_full():
    with engine.connect() as conn:
        print("Dropping all tables and types in public schema...")
        
        # Drop all tables
        result = conn.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"))
        for table in result.fetchall():
            print(f"Dropping table {table[0]}")
            conn.execute(text(f"DROP TABLE IF EXISTS {table[0]} CASCADE"))
            
        # Drop all custom types (enums)
        result = conn.execute(text("SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND typtype = 'e'"))
        for typ in result.fetchall():
            print(f"Dropping type {typ[0]}")
            conn.execute(text(f"DROP TYPE IF EXISTS {typ[0]} CASCADE"))
            
        conn.commit()
    
    print("Recreating all tables and types...")
    Base.metadata.create_all(bind=engine)
    print("✅ Full Database reset successfully")

if __name__ == "__main__":
    reset_db_full()
