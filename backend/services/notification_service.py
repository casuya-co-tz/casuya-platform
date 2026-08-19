from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.settings import get_settings
from backend.models.notification import Notification

_settings = get_settings()


def _send_sms(phone: str, message: str) -> bool:
    """Send SMS via Africa's Talking if configured."""
    if not _settings.africastalking_username or not _settings.africastalking_api_key:
        return False
    try:
        resp = httpx.post(
            "https://api.africastalking.com/version1/messaging",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "apiKey": _settings.africastalking_api_key,
            },
            data={
                "username": _settings.africastalking_username,
                "to": phone,
                "message": message,
            },
            timeout=5.0,
        )
        return resp.status_code == 201 or resp.status_code == 200
    except Exception:
        return False


def send_notification(user_id: str, message: str, channel: str = "in_app", phone: str | None = None) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        notification = Notification(
            user_id=user_id,
            channel=channel,
            message=message,
            is_read=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(notification)
        db.commit()

        # Send via external channel if configured
        if channel == "sms" and phone:
            _send_sms(phone, message)

        return {"id": notification.id, "user_id": user_id, "channel": channel, "message": message}
    finally:
        _gen.close()


def list_notifications(user_id: str) -> list[dict]:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )
        return [
            {"id": n.id, "user_id": n.user_id, "channel": n.channel, "message": n.message, "is_read": n.is_read}
            for n in notifications
        ]
    finally:
        _gen.close()


def mark_notification_read(notification_id: str) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise ValueError("Notification not found")
        notification.is_read = True
        db.commit()
        return {"id": notification.id, "is_read": True}
    finally:
        _gen.close()
