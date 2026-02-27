from app.database.database import SessionLocal
from app.models.department import Department
from app.models.skill import Skill
from app.models.user import User, UserRole
from app.utils.password_handler import get_password_hash

def seed_hrms_data():
    db = SessionLocal()
    try:
        # 1. Create Departments
        departments = [
            "Engineering",
            "Human Resources",
            "Marketing",
            "Sales",
            "Operations"
        ]
        dept_objs = []
        for d_name in departments:
            dept = db.query(Department).filter(Department.name == d_name).first()
            if not dept:
                dept = Department(name=d_name, description=f"{d_name} Department")
                db.add(dept)
                dept_objs.append(dept)
        
        # 2. Create Skills
        skills = [
            "Python", "React", "Node.js", "PostgreSQL", "Docker",
            "Communication", "Leadership", "Project Management",
            "Public Speaking", "Data Analysis"
        ]
        for s_name in skills:
            skill = db.query(Skill).filter(Skill.name == s_name).first()
            if not skill:
                skill = Skill(name=s_name, category="Technical" if skills.index(s_name) < 5 else "Soft Skill")
                db.add(skill)

        # 3. Create Super Admin if not exists
        admin = db.query(User).filter(User.username == "superadmin").first()
        if not admin:
            admin = User(
                username="superadmin",
                email="admin@hrms.com",
                hashed_password=get_password_hash("string@12"),
                role=UserRole.SUPER_ADMIN
            )
            db.add(admin)
        else:
            admin.hashed_password = get_password_hash("string@12")
            admin.role = UserRole.SUPER_ADMIN

        # 4. Create Sample Employees
        from app.models.employee_profile import EmployeeProfile
        from app.models.employee_skill import EmployeeSkill
        import random

        sample_employees = [
            ("John", "Doe", "DEV001", "Engineering"),
            ("Jane", "Smith", "HR001", "Human Resources"),
            ("Robert", "Brown", "OPS001", "Operations"),
            ("Emily", "Davis", "MKT001", "Marketing"),
            ("Michael", "Wilson", "SAL001", "Sales")
        ]

        all_skills = db.query(Skill).all()
        all_depts = {d.name: d.id for d in db.query(Department).all()}

        for fname, lname, eid, dept_name in sample_employees:
            username = f"{fname.lower()}.{lname.lower()}"
            user = db.query(User).filter(User.username == username).first()
            if not user:
                from datetime import datetime
                user = User(
                    username=username,
                    email=f"{username}@hrms.com",
                    hashed_password=get_password_hash("string@12"),
                    role=UserRole.EMPLOYEE,
                    last_login=datetime.utcnow()
                )
                db.add(user)
                db.flush()

                profile = EmployeeProfile(
                    user_id=user.id,
                    employee_id=eid,
                    first_name=fname,
                    last_name=lname,
                    department_id=all_depts.get(dept_name)
                )
                db.add(profile)
                db.flush()

                # Add random skills
                emp_skills = random.sample(all_skills, k=3)
                for s in emp_skills:
                    db.add(EmployeeSkill(
                        employee_id=profile.id,
                        skill_id=s.id,
                        proficiency_level="intermediate",
                        years_of_experience=random.randint(1, 5)
                    ))

        db.commit()
        print("✅ HRMS data seeded successfully")
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_hrms_data()
