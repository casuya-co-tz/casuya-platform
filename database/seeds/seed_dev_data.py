import uuid

from backend.config.database import init_db, get_db
from backend.config.security import hash_password
from backend.models.lesson import Subject, Topic, Subtopic, Lesson
from backend.models.role import Role
from backend.models.student import Student
from backend.models.teacher import Teacher
from backend.models.user import User
from backend.models.game import Game
from backend.models.quiz import Quiz
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
    extra_student = User(email="student2@casuya.co.tz", hashed_password=hash_password("student123"), role="student", is_active=True)
    db.add_all([admin, teacher, student, extra_student])
    db.flush()

    db.add(Teacher(user_id=teacher.id, full_name="Demo Teacher", school_code="DEMO"))
    db.add(Student(user_id=student.id, full_name="Demo Student", form_level="I", school_code="DEMO"))
    db.add(Student(user_id=extra_student.id, full_name="Extra Student", form_level="II", school_code="DEMO"))

    subjects_data = [
        ("Mathematics", "mathematics"),
        ("Chemistry", "chemistry"),
        ("Physics", "physics"),
        ("Biology", "biology"),
        ("English", "english"),
        ("Kiswahili", "kiswahili"),
    ]
    subjects = {}
    for name, slug in subjects_data:
        subj = Subject(name=name, slug=slug)
        db.add(subj)
        db.flush()
        subjects[slug] = subj

    form_levels = ["I", "II", "III", "IV"]
    topics_data = [
        ("mathematics", "Algebra", "I"),
        ("mathematics", "Geometry", "II"),
        ("mathematics", "Trigonometry", "III"),
        ("chemistry", "Atomic Structure", "I"),
        ("chemistry", "Chemical Bonding", "II"),
        ("physics", "Mechanics", "I"),
        ("physics", "Thermodynamics", "II"),
        ("biology", "Cell Biology", "I"),
        ("biology", "Genetics", "III"),
        ("english", "Grammar", "I"),
        ("english", "Literature", "II"),
        ("kiswahili", "Sarufi", "I"),
        ("kiswahili", "Fasihi", "II"),
    ]
    topics = {}
    for subj_slug, title, form in topics_data:
        topic = Topic(subject_id=subjects[subj_slug].id, title=title, form_level=form)
        db.add(topic)
        db.flush()
        topics[title] = topic

    subtopics_data = [
        ("Algebra", "Linear Equations"),
        ("Algebra", "Quadratic Equations"),
        ("Geometry", "Triangles"),
        ("Atomic Structure", "Protons and Electrons"),
        ("Cell Biology", "Cell Division"),
        ("Grammar", "Parts of Speech"),
        ("Sarufi", "Ngeli za Kiswahili"),
    ]
    for topic_title, sub_title in subtopics_data:
        db.add(Subtopic(topic_id=topics[topic_title].id, title=sub_title))
    db.flush()

    lesson = Lesson(
        subtopic_id=db.query(Subtopic).filter(Subtopic.title == "Linear Equations").first().id,
        slug="intro-to-linear-equations",
        title="Introduction to Linear Equations",
        status="published",
    )
    db.add(lesson)

    sample_game = Game(
        title="Math Challenge",
        description="Solve math problems against the clock",
        subject_id=subjects["mathematics"].id,
        form_level="I",
    )
    db.add(sample_game)

    sample_quiz = Quiz(
        title="Algebra Basics Quiz",
        description="Test your algebra knowledge",
        subject_id=subjects["mathematics"].id,
        form_level="I",
    )
    db.add(sample_quiz)

    db.commit()
    print("Development data seeded successfully.")
    print()
    print("  Accounts:")
    print("    Admin:   admin@casuya.co.tz / admin123")
    print("    Teacher: teacher@casuya.co.tz / teacher123")
    print("    Student: student@casuya.co.tz / student123")
    print("    Student: student2@casuya.co.tz / student123")
    print()
    print("  Subjects:", len(subjects_data))
    print("  Topics:", len(topics_data))
    print("  Subtopics:", len(subtopics_data))
    print("  Lessons: 1")
    print("  Games: 1")
    print("  Quizzes: 1")


if __name__ == "__main__":
    run()
