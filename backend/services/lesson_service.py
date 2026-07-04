import hashlib
import json
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.settings import get_settings
from backend.models.lesson import Lesson
from backend.models.lesson_version import LessonVersion


def create_lesson_from_html(subtopic_id: str, title: str, html: str) -> dict:
    db: Session = next(get_db())
    slug = title.lower().replace(" ", "-") + "-" + uuid.uuid4().hex[:8]
    content_hash = hashlib.sha256(html.encode()).hexdigest()
    lesson = Lesson(
        subtopic_id=subtopic_id,
        slug=slug,
        title=title,
        content_hash=content_hash,
    )
    db.add(lesson)
    db.flush()
    settings = get_settings()
    package_dir = Path(settings.storage_root) / "lesson-packages"
    package_dir.mkdir(parents=True, exist_ok=True)
    package_path = package_dir / f"{slug}.json"
    package = {"id": lesson.id, "slug": slug, "title": title, "html": html, "content_hash": content_hash}
    package_path.write_text(json.dumps(package), encoding="utf-8")
    version = LessonVersion(
        lesson_id=lesson.id,
        package_version="1.0.0",
        content_hash=content_hash,
        package_path=str(package_path),
    )
    db.add(version)
    db.commit()
    return {
        "id": lesson.id,
        "slug": slug,
        "title": title,
        "content_hash": content_hash,
        "package_version": "1.0.0",
        "status": "draft",
    }


def publish_lesson(lesson_id: str) -> dict:
    db: Session = next(get_db())
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError("Lesson not found")
    lesson.status = "published"
    db.commit()
    return {"id": lesson.id, "slug": lesson.slug, "status": "published"}


def get_lesson(lesson_id: str) -> dict | None:
    db: Session = next(get_db())
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return None
    return {
        "id": lesson.id,
        "subtopic_id": lesson.subtopic_id,
        "slug": lesson.slug,
        "title": lesson.title,
        "content_hash": lesson.content_hash,
        "package_version": lesson.package_version,
        "status": lesson.status,
    }


def list_lessons(subtopic_id: str | None = None, status: str | None = None) -> list[dict]:
    db: Session = next(get_db())
    query = db.query(Lesson)
    if subtopic_id:
        query = query.filter(Lesson.subtopic_id == subtopic_id)
    if status:
        query = query.filter(Lesson.status == status)
    lessons = query.all()
    return [
        {
            "id": l.id,
            "subtopic_id": l.subtopic_id,
            "slug": l.slug,
            "title": l.title,
            "status": l.status,
        }
        for l in lessons
    ]
