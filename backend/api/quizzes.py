from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse

from backend.middleware.auth import get_current_user
from backend.middleware.permissions import require_role
from backend.schemas.quizzes import QuizCreate, QuizCreateHTML, QuizResult, QuizSubmission
from backend.services.quiz_service import (
    create_quiz,
    create_quiz_from_html,
    get_quiz,
    get_quiz_for_lesson,
    grade_attempt,
    list_quizzes,
    publish_quiz,
    read_quiz_content,
)

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/", response_model=list[dict])
def list_quizzes_route(current_user=Depends(get_current_user)):
    return list_quizzes()


@router.get("/{quiz_id}", response_model=dict)
def get_quiz_route(quiz_id: str, current_user=Depends(get_current_user)):
    quiz = get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.get("/{quiz_id}/content")
def get_quiz_content_route(quiz_id: str, current_user=Depends(get_current_user)):
    quiz = get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    slug = quiz.get("slug")
    if not slug:
        raise HTTPException(status_code=404, detail="Quiz has no HTML content")
    html = read_quiz_content(slug)
    if html is None:
        raise HTTPException(status_code=404, detail="Quiz content not found")
    return HTMLResponse(content=html)


@router.get("/by-lesson/{lesson_id}", response_model=dict)
def get_quiz_for_lesson_route(lesson_id: str, current_user=Depends(get_current_user)):
    quiz = get_quiz_for_lesson(lesson_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found for this lesson")
    return quiz


@router.post("/", response_model=dict, dependencies=[Depends(require_role("admin"))])
def create_quiz_route(body: QuizCreate):
    return create_quiz(lesson_id=body.lesson_id, title=body.title, questions=body.questions)


@router.post("/from-html", response_model=dict, dependencies=[Depends(require_role("admin"))])
def create_quiz_from_html_route(body: QuizCreateHTML):
    return create_quiz_from_html(lesson_id=body.lesson_id, title=body.title, html=body.html_content)


@router.post("/{quiz_id}/publish", response_model=dict, dependencies=[Depends(require_role("admin"))])
def publish_quiz_route(quiz_id: str):
    try:
        return publish_quiz(quiz_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{quiz_id}", dependencies=[Depends(require_role("admin"))])
def delete_quiz_route(quiz_id: str):
    from backend.services.quiz_service import delete_quiz
    try:
        return delete_quiz(quiz_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{quiz_id}/submit", response_model=QuizResult)
def submit_quiz_attempt(quiz_id: str, body: QuizSubmission, current_user=Depends(get_current_user)):
    return grade_attempt(quiz_id=quiz_id, answers=body.answers)
