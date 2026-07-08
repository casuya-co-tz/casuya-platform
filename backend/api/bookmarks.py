from fastapi import APIRouter, Depends

from backend.middleware.auth import get_current_user
from backend.services.bookmark_service import add_bookmark, is_bookmarked, list_bookmarks, remove_bookmark

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("/", response_model=list[dict])
def list_bookmarks_route(current_user=Depends(get_current_user)):
    return list_bookmarks(current_user["sub"])


@router.post("/{lesson_id}", response_model=dict)
def add_bookmark_route(lesson_id: str, current_user=Depends(get_current_user)):
    return add_bookmark(current_user["sub"], lesson_id)


@router.delete("/{lesson_id}", response_model=dict)
def remove_bookmark_route(lesson_id: str, current_user=Depends(get_current_user)):
    return remove_bookmark(current_user["sub"], lesson_id)


@router.get("/{lesson_id}/status", response_model=dict)
def bookmark_status_route(lesson_id: str, current_user=Depends(get_current_user)):
    return {"bookmarked": is_bookmarked(current_user["sub"], lesson_id)}
