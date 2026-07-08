from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from backend.config.settings import get_settings
from backend.models.student import Student
from backend.models.teacher import Teacher
from backend.models.user import User

settings = get_settings()


def _dev_token_response(email: str, role: str = None) -> dict:
    """Generate a real JWT for a mock dev user when the database is unavailable."""
    if not role:
        if "admin" in email.lower():
            role = "admin"
        elif "teacher" in email.lower():
            role = "teacher"
        else:
            role = "student"
    user_id = f"dev-{email.split('@')[0]}"
    access_token = create_access_token(user_id, extra_claims={"role": role})
    refresh_token = create_refresh_token(user_id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user_id,
        "role": role,
    }


def register_user(email: str, password: str, full_name: str, role: str = "student", phone: str | None = None) -> dict:
    try:
        db: Session = next(get_db())
        if db.query(User).filter(User.email == email).first():
            raise ValueError("Email already registered")
        if phone and db.query(User).filter(User.phone == phone).first():
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
        access_token = create_access_token(user.id, extra_claims={"role": role})
        refresh_token = create_refresh_token(user.id)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
            "role": role,
        }
    except ValueError:
        raise
    except Exception:
        if settings.environment == "development":
            return _dev_token_response(email, role)
        raise


def authenticate_user(email: str, password: str) -> dict:
    try:
        db: Session = next(get_db())
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account is deactivated")
        access_token = create_access_token(user.id, extra_claims={"role": user.role})
        refresh_token = create_refresh_token(user.id)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
            "role": user.role,
        }
    except ValueError:
        raise
    except Exception:
        if settings.environment == "development":
            return _dev_token_response(email)
        raise


def refresh_access_token(refresh_token: str) -> dict:
    payload = decode_refresh_token(refresh_token)
    try:
        db: Session = next(get_db())
        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user or not user.is_active:
            raise ValueError("Invalid or deactivated user")
        access_token = create_access_token(user.id, extra_claims={"role": user.role})
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise
    except Exception:
        if settings.environment == "development":
            role = "student"
            try:
                p = decode_refresh_token(refresh_token)
            except Exception:
                p = {}
            access_token = create_access_token(payload["sub"], extra_claims={"role": role})
            return {"access_token": access_token, "token_type": "bearer"}
        raise
