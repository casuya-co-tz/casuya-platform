from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.student import Student
from backend.models.user import User


class StudentUpdateRequest(BaseModel):
    full_name: str | None = None
    form_level: str | None = None
    school_code: str | None = None


router = APIRouter(prefix="/students", tags=["students"])


def _get_current_student(current_user: dict, db: Session) -> Student:
    student = db.query(Student).filter(Student.user_id == current_user["sub"]).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.get("")
def list_students(current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    students = db.query(Student).all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "full_name": s.full_name,
            "form_level": s.form_level,
            "school_code": s.school_code,
        }
        for s in students
    ]


@router.get("/me", response_model=dict)
def get_my_profile(current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    student = _get_current_student(current_user, db)
    return {
        "id": student.id,
        "user_id": student.user_id,
        "full_name": student.full_name,
        "form_level": student.form_level,
        "school_code": student.school_code,
    }


@router.patch("/me", response_model=dict)
def update_my_profile(body: StudentUpdateRequest, current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    student = _get_current_student(current_user, db)
    if body.full_name is not None:
        student.full_name = body.full_name
    if body.form_level is not None:
        student.form_level = body.form_level
    if body.school_code is not None:
        student.school_code = body.school_code
    db.commit()
    return {
        "id": student.id,
        "user_id": student.user_id,
        "full_name": student.full_name,
        "form_level": student.form_level,
        "school_code": student.school_code,
    }


@router.get("/{student_id}")
def get_student(student_id: str, current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"error": "not_found"}
    return {
        "id": student.id,
        "user_id": student.user_id,
        "full_name": student.full_name,
        "form_level": student.form_level,
        "school_code": student.school_code,
    }

