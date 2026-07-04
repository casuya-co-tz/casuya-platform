from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.models.notification import Notification


def send_notification(user_id: str, message: str, channel: str = "in_app") -> dict:
    db: Session = next(get_db())
    notification = Notification(
        user_id=user_id,
        channel=channel,
        message=message,
        is_read=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    db.commit()
    return {"id": notification.id, "user_id": user_id, "channel": channel, "message": message}


def list_notifications(user_id: str) -> list[dict]:
    db: Session = next(get_db())
    notifications = (
        db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    )
    return [
        {"id": n.id, "user_id": n.user_id, "channel": n.channel, "message": n.message, "is_read": n.is_read}
        for n in notifications
    ]


def mark_notification_read(notification_id: str) -> dict:
    db: Session = next(get_db())
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise ValueError("Notification not found")
    notification.is_read = True
    db.commit()
    return {"id": notification.id, "is_read": True}
