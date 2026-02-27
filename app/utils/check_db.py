from app.database.database import SessionLocal
from app.models.department import Department
from app.models.user import User

def check_data():
    db = SessionLocal()
    try:
        depts = db.query(Department).all()
        print(f"Total Departments: {len(depts)}")
        for d in depts:
            print(f"ID: {d.id}, Name: {d.name}")
            
        users = db.query(User).all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"ID: {u.id}, Username: {u.username}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
