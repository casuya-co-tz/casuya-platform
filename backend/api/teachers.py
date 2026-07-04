from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.teacher import Teacher

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("/")
def list_teachers(current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    teachers = db.query(Teacher).all()
    return [
        {
            "id": t.id,
            "user_id": t.user_id,
            "full_name": t.full_name,
            "subjects": t.subjects,
            "school_code": t.school_code,
        }
        for t in teachers
    ]


@router.get("/{teacher_id}")
def get_teacher(teacher_id: str, current_user=Depends(get_current_user)):
    db: Session = next(get_db())
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        return {"error": "not_found"}
    return {
        "id": teacher.id,
        "user_id": teacher.user_id,
        "full_name": teacher.full_name,
        "subjects": teacher.subjects,
        "school_code": teacher.school_code,
    }
