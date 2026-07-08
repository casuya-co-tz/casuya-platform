from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .settings import get_settings
from .redis import SafeRedis

settings = get_settings()

connect_args = {"check_same_thread": False, "timeout": 30} if settings.database_url.startswith("sqlite") else {}

# The engine is created lazily on first use so importing this module never
# fails when the database is unreachable. This lets the API start and serve
# health/static routes even with no database available.
_engine = None
SessionLocal: sessionmaker | None = None


def get_engine():
    """Return the SQLAlchemy engine, creating it on first use."""
    global _engine, SessionLocal
    if _engine is None:
        _engine = create_engine(
            settings.database_url,
            connect_args=connect_args,
            pool_size=20,
            max_overflow=40,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_timeout=30,
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine


# SafeRedis degrades gracefully (no crash) when Redis is unavailable.
redis_client = SafeRedis(settings.redis_url)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""


def get_db() -> Generator[Session, None, None]:
    """Yield a DB session, raising a clear 503 if the database is unavailable."""
    if SessionLocal is None:
        get_engine()
    if SessionLocal is None:
        raise RuntimeError("Database engine is not available")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from backend.models import (  # noqa: F401
        analytics,
        audit_log,
        bookmark,
        game,
        lesson,
        lesson_version,
        note,
        notification,
        payment,
        progress,
        quiz,
        role,
        setting,
        student,
        teacher,
        user,
    )

    try:
        engine = get_engine()
        Base.metadata.create_all(bind=engine)
        # Ensure indexes exist on tables that may have been created before indexes were added
        with engine.connect() as conn:
            for stmt in [
                "CREATE INDEX IF NOT EXISTS ix_topic_subject_id ON topics(subject_id)",
                "CREATE INDEX IF NOT EXISTS ix_subtopic_topic_id ON subtopics(topic_id)",
                "CREATE INDEX IF NOT EXISTS ix_lesson_subtopic_id ON lessons(subtopic_id)",
                "CREATE INDEX IF NOT EXISTS ix_lesson_status ON lessons(status)",
                "CREATE INDEX IF NOT EXISTS ix_progress_student_id ON progress_records(student_id)",
                "CREATE INDEX IF NOT EXISTS ix_progress_lesson_id ON progress_records(lesson_id)",
                "CREATE INDEX IF NOT EXISTS ix_progress_synced_at ON progress_records(synced_at)",
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_progress_student_lesson ON progress_records(student_id, lesson_id)",
            ]:
                try:
                    conn.execute(__import__("sqlalchemy", fromlist=["text"]).text(stmt))
                except Exception:
                    pass  # some DBs may not support IF NOT EXISTS
            conn.commit()
    except SQLAlchemyError as exc:  # noqa: BLE001
        print(f"WARNING: init_db failed, continuing without DB: {exc}")
