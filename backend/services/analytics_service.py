from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.config.database import get_db
from backend.models.analytics import LessonAnalyticsSnapshot
from backend.models.progress import ProgressRecord


def recompute_lesson_snapshot(lesson_id: str) -> dict:
    db: Session = next(get_db())
    stats = db.query(
        func.count(ProgressRecord.id),
        func.avg(ProgressRecord.completion_percentage),
        func.avg(ProgressRecord.score_percentage),
    ).filter(ProgressRecord.lesson_id == lesson_id).first()
    session_count = stats[0] or 0
    avg_completion = float(stats[1] or 0.0)
    avg_score = float(stats[2] or 0.0)
    snapshot = LessonAnalyticsSnapshot(
        lesson_id=lesson_id,
        session_count=session_count,
        avg_completion_percentage=round(avg_completion, 2),
        avg_score_percentage=round(avg_score, 2),
        generated_at=datetime.now(timezone.utc),
    )
    db.add(snapshot)
    db.commit()
    return {
        "lesson_id": lesson_id,
        "session_count": session_count,
        "avg_completion_percentage": round(avg_completion, 2),
        "avg_score_percentage": round(avg_score, 2),
    }


def get_lesson_analytics(lesson_id: str) -> dict | None:
    db: Session = next(get_db())
    snapshot = db.query(LessonAnalyticsSnapshot).filter(
        LessonAnalyticsSnapshot.lesson_id == lesson_id
    ).order_by(LessonAnalyticsSnapshot.generated_at.desc()).first()
    if not snapshot:
        return None
    return {
        "lesson_id": snapshot.lesson_id,
        "session_count": snapshot.session_count,
        "avg_completion_percentage": snapshot.avg_completion_percentage,
        "avg_score_percentage": snapshot.avg_score_percentage,
    }


def get_platform_overview() -> dict:
    from backend.models.student import Student
    from backend.models.lesson import Lesson

    db: Session = next(get_db())
    total_students = db.query(Student).count()
    total_lessons = db.query(Lesson).filter(Lesson.status == "published").count()
    total_sessions = db.query(ProgressRecord).count()
    avg_completion = db.query(func.avg(ProgressRecord.completion_percentage)).scalar() or 0.0
    return {
        "total_students": total_students,
        "total_lessons": total_lessons,
        "total_sessions": total_sessions,
        "avg_completion_rate": round(float(avg_completion), 2),
    }
