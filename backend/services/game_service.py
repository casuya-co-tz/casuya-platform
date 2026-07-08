import hashlib
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.settings import get_settings
from backend.models.game import Game

settings = get_settings()


def _get_game_pkg_path(slug: str) -> Path:
    storage = Path(settings.storage_root) / "game-packages"
    if len(slug) < 4:
        return storage / f"{slug}.html"
    return storage / slug[:2] / slug[2:4] / f"{slug}.html"


def get_games_for_lesson(lesson_id: str) -> list[dict]:
    db: Session = next(get_db())
    games = db.query(Game).filter(Game.lesson_id == lesson_id).all()
    result = []
    for g in games:
        result.append({
            "id": g.id,
            "lesson_id": g.lesson_id,
            "title": g.title,
            "package_path": g.package_path,
            "slug": g.slug,
            "content_hash": g.content_hash,
            "status": g.status,
        })
    return result


def list_games() -> list[dict]:
    db: Session = next(get_db())
    games = db.query(Game).all()
    return [
        {
            "id": g.id,
            "lesson_id": g.lesson_id,
            "title": g.title,
            "slug": g.slug,
            "status": g.status,
            "content_hash": g.content_hash,
        }
        for g in games
    ]


def get_game(game_id: str) -> dict | None:
    db: Session = next(get_db())
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        return None
    return {
        "id": game.id,
        "lesson_id": game.lesson_id,
        "title": game.title,
        "slug": game.slug,
        "status": game.status,
        "content_hash": game.content_hash,
    }


def read_game_content(slug: str) -> str | None:
    pkg_path = _get_game_pkg_path(slug)
    if not pkg_path.exists():
        return None
    return pkg_path.read_text(encoding="utf-8")


def create_game_from_html(lesson_id: str | None, title: str, html: str) -> dict:
    db: Session = next(get_db())
    slug = title.lower().replace(" ", "-") + "-" + uuid.uuid4().hex[:8]
    content_hash = hashlib.sha256(html.encode()).hexdigest()
    game = Game(lesson_id=lesson_id, title=title, slug=slug, content_hash=content_hash)
    db.add(game)
    db.flush()
    pkg_path = _get_game_pkg_path(slug)
    pkg_path.parent.mkdir(parents=True, exist_ok=True)
    pkg_path.write_text(html, encoding="utf-8")
    db.commit()
    return {"id": game.id, "slug": slug, "title": title, "content_hash": content_hash, "status": "draft"}


def publish_game(game_id: str) -> dict:
    db: Session = next(get_db())
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise ValueError("Game not found")
    game.status = "published"
    db.commit()
    return {"id": game.id, "slug": game.slug, "status": "published"}


def delete_game(game_id: str) -> dict:
    db: Session = next(get_db())
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise ValueError("Game not found")
    slug = game.slug
    db.delete(game)
    db.commit()
    if slug:
        pkg_path = _get_game_pkg_path(slug)
        if pkg_path.exists():
            pkg_path.unlink()
    return {"detail": "Game deleted"}
