from __future__ import annotations

from collections.abc import Generator

from redis import Redis
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .settings import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False, "timeout": 30} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


redis_client = Redis.from_url(settings.redis_url)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from backend.models import (  # noqa: F401
        analytics,
        audit_log,
        game,
        lesson,
        lesson_version,
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

    Base.metadata.create_all(bind=engine)
