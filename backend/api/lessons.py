from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.exc import IntegrityError

from backend.middleware.auth import get_current_user
from backend.middleware.permissions import require_role
from backend.schemas.lessons import LessonCreate, LessonResponse, LessonUpdate
from backend.services.lesson_service import (
    create_lesson_from_html,
    delete_lesson,
    get_lesson,
    get_package_path,
    list_lessons,
    publish_lesson,
    read_lesson_content,
    update_lesson,
)

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("")
def list_lessons_route(
    subtopic_id: str | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(get_current_user),
):
    return list_lessons(subtopic_id=subtopic_id, status=status, skip=skip, limit=limit)


@router.get("/{lesson_id}")
def get_lesson_route(lesson_id: str, current_user=Depends(get_current_user)):
    lesson = get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.get("/{lesson_id}/content")
def get_lesson_content_route(lesson_id: str, request: Request, current_user=Depends(get_current_user)):
    lesson = get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    slug = lesson["slug"]
    html = read_lesson_content(slug)
    if html is None:
        raise HTTPException(status_code=404, detail="Lesson content not found")
    return HTMLResponse(content=html, headers={"X-Content-Hash": lesson.get("content_hash", "")})


@router.post("", response_model=dict, dependencies=[Depends(require_role("admin"))])
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


@router.delete("/{lesson_id}", dependencies=[Depends(require_role("admin"))])
def delete_lesson_route(lesson_id: str):
    try:
        return delete_lesson(lesson_id)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Lesson cannot be deleted due to database constraints")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{lesson_id}", response_model=dict, dependencies=[Depends(require_role("admin"))])
def update_lesson_route(lesson_id: str, body: LessonUpdate):
    try:
        return update_lesson(
            lesson_id=lesson_id,
            title=body.title,
            html=body.html_content,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
