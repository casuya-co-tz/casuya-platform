from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.student import Student
from backend.models.user import User

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/")
def list_students(current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    students = db.query(Student).all()
    return [
        {"id": s.id, "user_id": s.user_id, "full_name": s.full_name, "form_level": s.form_level, "school_code": s.school_code}
        for s in students
    ]


@router.get("/{student_id}")
def get_student(student_id: str, current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"error": "not_found"}
    return {"id": student.id, "user_id": student.user_id, "full_name": student.full_name, "form_level": student.form_level, "school_code": student.school_code}
