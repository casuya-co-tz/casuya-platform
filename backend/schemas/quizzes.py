from pydantic import BaseModel


class QuizCreate(BaseModel):
    lesson_id: str
    title: str
    questions: list[dict]


class QuizResponse(BaseModel):
    id: str
    lesson_id: str
    title: str


class QuizSubmission(BaseModel):
    answers: dict[str, str]


class QuizResult(BaseModel):
    quiz_id: str
    score: int
    total: int
    percentage: float
