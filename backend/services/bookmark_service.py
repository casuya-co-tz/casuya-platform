from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.models.bookmark import Bookmark
from backend.models.lesson import Lesson


def list_bookmarks(user_id: str) -> list[dict]:
    gen = get_db()
    db: Session = next(gen)
    try:
        rows = db.query(Bookmark, Lesson.title).join(
            Lesson, Bookmark.lesson_id == Lesson.id
        ).filter(Bookmark.user_id == user_id).order_by(Bookmark.created_at.desc()).all()
        return [
            {
                "id": b.Bookmark.id,
                "lesson_id": b.Bookmark.lesson_id,
                "lesson_title": b.title,
                "created_at": b.Bookmark.created_at.isoformat() if b.Bookmark.created_at else None,
            }
            for b in rows
        ]
    finally:
        gen.close()


def add_bookmark(user_id: str, lesson_id: str) -> dict:
    gen = get_db()
    db: Session = next(gen)
    try:
        existing = db.query(Bookmark).filter(
            Bookmark.user_id == user_id, Bookmark.lesson_id == lesson_id
        ).first()
        if existing:
            return {"id": existing.id, "lesson_id": lesson_id, "status": "already_bookmarked"}
        bm = Bookmark(user_id=user_id, lesson_id=lesson_id)
        db.add(bm)
        db.commit()
        return {"id": bm.id, "lesson_id": lesson_id, "status": "bookmarked"}
    finally:
        gen.close()


def remove_bookmark(user_id: str, lesson_id: str) -> dict:
    gen = get_db()
    db: Session = next(gen)
    try:
        bm = db.query(Bookmark).filter(
            Bookmark.user_id == user_id, Bookmark.lesson_id == lesson_id
        ).first()
        if bm:
            db.delete(bm)
            db.commit()
        return {"lesson_id": lesson_id, "status": "removed"}
    finally:
        gen.close()


def is_bookmarked(user_id: str, lesson_id: str) -> bool:
    gen = get_db()
    db: Session = next(gen)
    try:
        return db.query(Bookmark).filter(
            Bookmark.user_id == user_id, Bookmark.lesson_id == lesson_id
        ).first() is not None
    finally:
        gen.close()
