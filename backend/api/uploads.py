from fastapi import APIRouter, Depends, HTTPException, UploadFile

from backend.middleware.permissions import require_role
from backend.services.upload_service import store_upload

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/")
async def upload_file(file: UploadFile, current_user=Depends(require_role("admin"))):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    kind = {
        "png": "images",
        "jpg": "images",
        "jpeg": "images",
        "gif": "images",
        "svg": "images",
        "mp4": "videos",
        "webm": "videos",
        "mp3": "audio",
        "wav": "audio",
        "ogg": "audio",
    }.get(ext, "images")
    content = await file.read()
    path = store_upload(content, file.filename, kind)
    return {"path": path, "filename": file.filename, "kind": kind}
