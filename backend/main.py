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
from backend.middleware.security_headers import SecurityHeadersMiddleware
from backend.middleware.sentry import init_sentry

settings = get_settings()
configure_logging()
init_sentry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Offline-first lesson delivery, quizzes, games, and progress tracking for Tanzanian secondary education.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    debug=settings.debug,
    lifespan=lifespan,
)

add_cors(app)
register_error_handlers(app)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

for router_module in (
    auth, users, students, teachers, lessons, subjects, topics, subtopics,
    quizzes, games, progress, analytics, payments, notifications, search, uploads,
):
    app.include_router(router_module.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.environment}


@app.get("/readyz")
def readiness_check():
    from sqlalchemy import text

    from backend.config.database import SessionLocal, redis_client

    db_ok = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception:
        pass

    redis_ok = False
    try:
        redis_client.ping()
        redis_ok = True
    except Exception:
        pass

    return {
        "status": "ok" if db_ok and redis_ok else "degraded",
        "database": db_ok,
        "redis": redis_ok,
    }
