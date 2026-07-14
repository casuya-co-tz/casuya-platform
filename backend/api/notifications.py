from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.middleware.auth import get_current_user
from backend.middleware.permissions import require_role
from backend.models.user import User
from backend.config.database import get_db
from backend.services.notification_service import list_notifications, mark_notification_read, send_notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


class SendNotificationRequest(BaseModel):
    user_id: str | None = None
    role: str | None = None
    message: str


@router.get("", response_model=list[dict])
def list_notifications_route(current_user=Depends(get_current_user)):
    return list_notifications(user_id=current_user["sub"])


@router.post("", dependencies=[Depends(require_role("admin"))])
def send_notification_route(body: SendNotificationRequest):
    if not body.user_id and not body.role:
        raise HTTPException(status_code=400, detail="Provide user_id or role")
    if body.user_id:
        result = send_notification(user_id=body.user_id, message=body.message)
        return {"sent": 1, "notifications": [result]}
    _gen = get_db()
    db: Session = next(_gen)
    try:
        users = db.query(User).filter(User.role == body.role, User.is_active == True).all()
        if not users:
            raise HTTPException(status_code=404, detail=f"No active {body.role}s found")
        results = []
        for u in users:
            results.append(send_notification(user_id=u.id, message=body.message))
        return {"sent": len(results), "notifications": results}
    finally:
        _gen.close()


@router.post("/bulk", dependencies=[Depends(require_role("admin"))])
def send_bulk_notification_route(body: SendNotificationRequest):
    if not body.role:
        raise HTTPException(status_code=400, detail="Provide role (student|teacher)")
    _gen = get_db()
    db: Session = next(_gen)
    try:
        users = db.query(User).filter(User.role == body.role, User.is_active == True).all()
        if not users:
            raise HTTPException(status_code=404, detail=f"No active {body.role}s found")
        results = []
        for u in users:
            results.append(send_notification(user_id=u.id, message=body.message))
        return {"sent": len(results)}
    finally:
        _gen.close()


@router.post("/{notification_id}/read", response_model=dict)
def mark_read_route(notification_id: str, current_user=Depends(get_current_user)):
    try:
        return mark_notification_read(notification_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
