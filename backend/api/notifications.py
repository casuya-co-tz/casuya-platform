from fastapi import APIRouter, Depends, HTTPException

from backend.middleware.auth import get_current_user
from backend.schemas.notifications import NotificationResponse
from backend.services.notification_service import list_notifications, mark_notification_read

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=list[dict])
def list_notifications_route(current_user=Depends(get_current_user)):
    return list_notifications(user_id=current_user["sub"])


@router.post("/{notification_id}/read", response_model=dict)
def mark_read_route(notification_id: str, current_user=Depends(get_current_user)):
    try:
        return mark_notification_read(notification_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
