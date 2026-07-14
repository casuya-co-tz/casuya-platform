import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.config.settings import get_settings
from backend.middleware.permissions import require_role
from backend.services.upload_service import store_upload

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_KINDS = {"images", "videos", "audio", "documents"}


def _scan_files() -> list[dict]:
    settings = get_settings()
    root = Path(settings.storage_root)
    files = []
    for kind_dir in root.iterdir() if root.exists() else []:
        if not kind_dir.is_dir() or kind_dir.name.startswith("."):
            continue
        for f in kind_dir.iterdir():
            if f.is_file() and not f.name.startswith("."):
                files.append({
                    "filename": f.name,
                    "path": f"{kind_dir.name}/{f.name}",
                    "kind": kind_dir.name,
                    "size": f.stat().st_size,
                    "uploaded_at": f.stat().st_mtime,
                })
    files.sort(key=lambda x: x.get("uploaded_at", 0), reverse=True)
    return files


@router.get("")
async def list_files(current_user=Depends(require_role("admin"))):
    return _scan_files()


@router.get("/public")
async def list_files_public():
    return _scan_files()


@router.post("")
async def upload_file(file: UploadFile, current_user=Depends(require_role("admin"))):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    kind = {
        "png": "images", "jpg": "images", "jpeg": "images",
        "gif": "images", "svg": "images", "webp": "images",
        "pdf": "documents", "doc": "documents", "docx": "documents", "txt": "documents",
        "mp4": "videos", "webm": "videos",
        "mp3": "audio", "wav": "audio", "ogg": "audio",
    }.get(ext, "images")
    content = await file.read()
    path = store_upload(content, file.filename, kind)
    return {"path": path, "filename": file.filename, "kind": kind}


@router.get("/{filename:path}")
async def serve_file(filename: str):
    settings = get_settings()
    root = Path(settings.storage_root)
    for kind_dir in root.iterdir() if root.exists() else []:
        if not kind_dir.is_dir():
            continue
        target = kind_dir / filename
        if target.exists() and target.is_file():
            return FileResponse(target, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")


@router.delete("/{filename:path}")
async def delete_file(filename: str, current_user=Depends(require_role("admin"))):
    settings = get_settings()
    root = Path(settings.storage_root)
    for kind_dir in root.iterdir() if root.exists() else []:
        if not kind_dir.is_dir():
            continue
        target = kind_dir / filename
        if target.exists() and target.is_file():
            target.unlink()
            return {"deleted": filename}
    raise HTTPException(status_code=404, detail="File not found")
