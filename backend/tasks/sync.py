from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.models.progress import ProgressRecord


def run_pending_sync_reconciliation():
    db: Session = next(get_db())
    pending = db.query(ProgressRecord).filter(ProgressRecord.completion_percentage < 0).all()
    for record in pending:
        record.completion_percentage = max(record.completion_percentage, 0.0)
    db.commit()
    return len(pending)
