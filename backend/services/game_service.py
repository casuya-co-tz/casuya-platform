from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.models.game import Game


def get_games_for_lesson(lesson_id: str) -> list[dict]:
    db: Session = next(get_db())
    games = db.query(Game).filter(Game.lesson_id == lesson_id).all()
    return [{"id": g.id, "lesson_id": g.lesson_id, "title": g.title, "package_path": g.package_path} for g in games]
