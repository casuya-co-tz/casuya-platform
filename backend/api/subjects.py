from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.middleware.permissions import require_role
from backend.models.lesson import Subject
from backend.schemas.subjects import SubjectCreate, SubjectResponse

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("", response_model=list[SubjectResponse])
def list_subjects():
    _gen = get_db()
    db: Session = next(_gen)
    try:
        subjects = db.query(Subject).all()
        return [SubjectResponse(id=s.id, name=s.name, slug=s.slug) for s in subjects]
    finally:
        _gen.close()


@router.post("", response_model=SubjectResponse, dependencies=[Depends(require_role("admin"))])
def create_subject(body: SubjectCreate):
    _gen = get_db()
    db: Session = next(_gen)
    try:
        if db.query(Subject).filter(Subject.slug == body.slug).first():
            raise HTTPException(status_code=409, detail="Subject slug already exists")
        subject = Subject(name=body.name, slug=body.slug)
        db.add(subject)
        db.commit()
        return SubjectResponse(id=subject.id, name=subject.name, slug=subject.slug)
    finally:
        _gen.close()


@router.delete("/{subject_id}", dependencies=[Depends(require_role("admin"))])
def delete_subject(subject_id: str):
    _gen = get_db()
    db: Session = next(_gen)
    try:
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        try:
            db.delete(subject)
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(status_code=409, detail="Cannot delete: subject has related topics. Delete topics first.")
        return {"detail": "Subject deleted"}
    finally:
        _gen.close()
