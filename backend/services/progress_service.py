from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.models.progress import ProgressRecord


def apply_progress_sync(student_id: str, payload: dict) -> dict:
    db: Session = next(get_db())
    record = ProgressRecord(
        student_id=student_id,
        lesson_id=payload["lesson_id"],
        session_id=payload["session_id"],
        elapsed_ms=payload.get("elapsed_ms", 0),
        completion_percentage=payload.get("completion_percentage", 0.0),
        score_percentage=payload.get("score_percentage"),
        synced_at=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    return {"id": record.id, "student_id": student_id, "lesson_id": payload["lesson_id"], "status": "synced"}


def get_student_progress(student_id: str) -> list[dict]:
    db: Session = next(get_db())
    records = db.query(ProgressRecord).filter(ProgressRecord.student_id == student_id).all()
    return [
        {
            "id": r.id,
            "lesson_id": r.lesson_id,
            "session_id": r.session_id,
            "elapsed_ms": r.elapsed_ms,
            "completion_percentage": r.completion_percentage,
            "score_percentage": r.score_percentage,
        }
        for r in records
    ]
