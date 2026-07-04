from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.security import create_access_token, hash_password, verify_password
from backend.models.student import Student
from backend.models.teacher import Teacher
from backend.models.user import User


def register_user(email: str, password: str, full_name: str, role: str = "student", phone: str | None = None) -> dict:
    db: Session = next(get_db())
    if db.query(User).filter(User.email == email).first():
        raise ValueError("Email already registered")
    if db.query(User).filter(User.phone == phone).first():
        raise ValueError("Phone already registered")
    user = User(
        email=email,
        phone=phone,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.flush()
    if role == "student":
        profile = Student(user_id=user.id, full_name=full_name)
        db.add(profile)
    elif role == "teacher":
        profile = Teacher(user_id=user.id, full_name=full_name)
        db.add(profile)
    db.commit()
    token = create_access_token(user.id, extra_claims={"role": role})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "role": role}


def authenticate_user(email: str, password: str) -> dict:
    db: Session = next(get_db())
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password")
    if not user.is_active:
        raise ValueError("Account is deactivated")
    token = create_access_token(user.id, extra_claims={"role": user.role})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id, "role": user.role}
