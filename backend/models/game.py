"""Interactive game packages attached to a lesson (separate content type
from quizzes — see backend/api/games.py and services/game_service.py)."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.config.database import Base
from backend.models.user import _uuid


class Game(Base):
    __tablename__ = "games"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    lesson_id: Mapped[str] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    package_path: Mapped[str] = mapped_column(String, nullable=False)  # storage/lesson-packages/...
