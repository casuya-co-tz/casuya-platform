from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from backend.middleware.auth import get_current_user
from backend.schemas.progress import ProgressSyncPayload
from backend.services.progress_service import apply_progress_sync, get_student_progress

router = APIRouter(prefix="/progress", tags=["progress"])


def _do_sync(student_id: str, payload: dict):
    try:
        apply_progress_sync(student_id=student_id, payload=payload)
    except ValueError:
        pass  # silently drop invalid progress records rather than failing


@router.post("/sync", response_model=dict)
def sync_progress(body: ProgressSyncPayload, background_tasks: BackgroundTasks, current_user=Depends(get_current_user)):
    background_tasks.add_task(_do_sync, student_id=body.student_id, payload=body.model_dump())
    return {"status": "queued", "student_id": body.student_id, "lesson_id": body.lesson_id}


@router.get("/{student_id}", response_model=list[dict])
def get_student_progress_route(student_id: str, current_user=Depends(get_current_user)):
    return get_student_progress(student_id)
