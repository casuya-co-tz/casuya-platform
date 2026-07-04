"""Casuya Platform — FastAPI entrypoint.

Run locally with:
    uvicorn backend.main:app --reload
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.api import (
    analytics,
    auth,
    games,
    lessons,
    notifications,
    payments,
    progress,
    quizzes,
    search,
    students,
    subjects,
    subtopics,
    teachers,
    topics,
    uploads,
    users,
)
from backend.config.database import init_db
from backend.config.logging import configure_logging
from backend.config.settings import get_settings
from backend.middleware.cors import add_cors
from backend.middleware.errors import register_error_handlers
from backend.middleware.rate_limit import RateLimitMiddleware

settings = get_settings()
configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

add_cors(app)
register_error_handlers(app)
app.add_middleware(RateLimitMiddleware)

for router_module in (
    auth, users, students, teachers, lessons, subjects, topics, subtopics,
    quizzes, games, progress, analytics, payments, notifications, search, uploads,
):
    app.include_router(router_module.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.environment}
