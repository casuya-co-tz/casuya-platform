from fastapi import APIRouter, Depends

from backend.middleware.auth import get_current_user
from backend.services.game_service import get_games_for_lesson

router = APIRouter(prefix="/games", tags=["games"])


@router.get("/{lesson_id}", response_model=list[dict])
def get_games_for_lesson_route(lesson_id: str, current_user=Depends(get_current_user)):
    return get_games_for_lesson(lesson_id)
