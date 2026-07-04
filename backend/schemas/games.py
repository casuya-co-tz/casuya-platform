from pydantic import BaseModel


class GameResponse(BaseModel):
    id: str
    lesson_id: str
    title: str
    package_path: str
