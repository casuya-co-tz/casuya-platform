from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.middleware.auth import get_current_user
from backend.middleware.permissions import require_role
from backend.schemas.lessons import LessonCreate, LessonResponse
from backend.services.lesson_service import create_lesson_from_html, get_lesson, list_lessons, publish_lesson

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/", response_model=list[dict])
def list_lessons_route(
    subtopic_id: str | None = None, status: str | None = None, current_user=Depends(get_current_user)
):
    return list_lessons(subtopic_id=subtopic_id, status=status)


@router.get("/{lesson_id}", response_model=dict)
def get_lesson_route(lesson_id: str, current_user=Depends(get_current_user)):
    lesson = get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post("/", response_model=dict, dependencies=[Depends(require_role("admin"))])
def create_lesson_route(body: LessonCreate):
    try:
        return create_lesson_from_html(
            subtopic_id=body.subtopic_id,
            title=body.title,
            html=body.html_content,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{lesson_id}/publish", response_model=dict, dependencies=[Depends(require_role("admin"))])
def publish_lesson_route(lesson_id: str):
    try:
        return publish_lesson(lesson_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
