from fastapi import APIRouter, Depends, HTTPException

from backend.middleware.auth import get_current_user
from backend.middleware.permissions import require_role
from backend.schemas.quizzes import QuizCreate, QuizResult, QuizSubmission
from backend.services.quiz_service import create_quiz, get_quiz_for_lesson, grade_attempt

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/{lesson_id}", response_model=dict)
def get_quiz_for_lesson_route(lesson_id: str, current_user=Depends(get_current_user)):
    quiz = get_quiz_for_lesson(lesson_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found for this lesson")
    return quiz


@router.post("/", response_model=dict, dependencies=[Depends(require_role("admin"))])
def create_quiz_route(body: QuizCreate):
    return create_quiz(lesson_id=body.lesson_id, title=body.title, questions=body.questions)


@router.post("/{quiz_id}/submit", response_model=QuizResult)
def submit_quiz_attempt(quiz_id: str, body: QuizSubmission, current_user=Depends(get_current_user)):
    return grade_attempt(quiz_id=quiz_id, answers=body.answers)
