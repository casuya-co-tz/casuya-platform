from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.middleware.permissions import require_role
from backend.models.lesson import Topic
from backend.schemas.topics import TopicCreate, TopicResponse

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("", response_model=list[TopicResponse])
def list_topics(subject_id: str | None = None):
    db: Session = next(get_db())
    query = db.query(Topic)
    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)
    topics = query.all()
    return [TopicResponse(id=t.id, subject_id=t.subject_id, title=t.title, form_level=t.form_level) for t in topics]


@router.post("", response_model=TopicResponse, dependencies=[Depends(require_role("admin"))])
def create_topic(body: TopicCreate):
    db: Session = next(get_db())
    topic = Topic(subject_id=body.subject_id, title=body.title, form_level=body.form_level)
    db.add(topic)
    db.commit()
    return TopicResponse(id=topic.id, subject_id=topic.subject_id, title=topic.title, form_level=topic.form_level)


@router.delete("/{topic_id}", dependencies=[Depends(require_role("admin"))])
def delete_topic(topic_id: str):
    from fastapi import HTTPException
    db: Session = next(get_db())
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    try:
        db.delete(topic)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cannot delete: topic has related subtopics. Delete subtopics first.")
    return {"detail": "Topic deleted"}
