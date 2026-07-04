from fastapi import APIRouter, Depends, HTTPException

from backend.middleware.auth import get_current_user
from backend.schemas.progress import ProgressSyncPayload
from backend.services.progress_service import apply_progress_sync, get_student_progress

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/sync", response_model=dict)
def sync_progress(body: ProgressSyncPayload, current_user=Depends(get_current_user)):
    try:
        return apply_progress_sync(student_id=body.student_id, payload=body.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{student_id}", response_model=list[dict])
def get_student_progress_route(student_id: str, current_user=Depends(get_current_user)):
    return get_student_progress(student_id)
