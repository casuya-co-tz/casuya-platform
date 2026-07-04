from backend.config.database import init_db, get_db
from backend.config.security import hash_password
from backend.models.lesson import Subject, Topic, Subtopic, Lesson
from backend.models.role import Role
from backend.models.student import Student
from backend.models.teacher import Teacher
from backend.models.user import User
from sqlalchemy.orm import Session


def run():
    init_db()
    db: Session = next(get_db())
    if db.query(User).first():
        print("Database already seeded, skipping.")
        return
    for role_name in ("student", "teacher", "admin"):
        db.add(Role(name=role_name, description=f"{role_name.capitalize()} role"))
    admin = User(email="admin@casuya.co.tz", hashed_password=hash_password("admin123"), role="admin", is_active=True)
    teacher = User(email="teacher@casuya.co.tz", hashed_password=hash_password("teacher123"), role="teacher", is_active=True)
    student = User(email="student@casuya.co.tz", hashed_password=hash_password("student123"), role="student", is_active=True)
    db.add_all([admin, teacher, student])
    db.flush()
    db.add(Teacher(user_id=teacher.id, full_name="Demo Teacher", school_code="DEMO"))
    db.add(Student(user_id=student.id, full_name="Demo Student", form_level="I", school_code="DEMO"))
    maths = Subject(name="Mathematics", slug="mathematics")
    chem = Subject(name="Chemistry", slug="chemistry")
    db.add_all([maths, chem])
    db.flush()
    alg = Topic(subject_id=maths.id, title="Algebra", form_level="I")
    db.add(alg)
    db.flush()
    st = Subtopic(topic_id=alg.id, title="Linear Equations")
    db.add(st)
    db.flush()
    lesson = Lesson(
        subtopic_id=st.id,
        slug="intro-to-linear-equations",
        title="Introduction to Linear Equations",
        status="published",
    )
    db.add(lesson)
    db.commit()
    print("Development data seeded successfully.")
    print("  Admin:    admin@casuya.co.tz / admin123")
    print("  Teacher:  teacher@casuya.co.tz / teacher123")
    print("  Student:  student@casuya.co.tz / student123")


if __name__ == "__main__":
    run()
