from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.middleware.permissions import require_role
from backend.models.lesson import Subtopic
from backend.schemas.subtopics import SubtopicCreate, SubtopicResponse

router = APIRouter(prefix="/subtopics", tags=["subtopics"])


@router.get("/", response_model=list[SubtopicResponse])
def list_subtopics(topic_id: str | None = None):
    db: Session = next(get_db())
    query = db.query(Subtopic)
    if topic_id:
        query = query.filter(Subtopic.topic_id == topic_id)
    subtopics = query.all()
    return [SubtopicResponse(id=s.id, topic_id=s.topic_id, title=s.title) for s in subtopics]


@router.post("/", response_model=SubtopicResponse, dependencies=[Depends(require_role("admin"))])
def create_subtopic(body: SubtopicCreate):
    db: Session = next(get_db())
    subtopic = Subtopic(topic_id=body.topic_id, title=body.title)
    db.add(subtopic)
    db.commit()
    return SubtopicResponse(id=subtopic.id, topic_id=subtopic.topic_id, title=subtopic.title)
