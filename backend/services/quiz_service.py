from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.models.quiz import Quiz, QuizOption, QuizQuestion


def create_quiz(lesson_id: str, title: str, questions: list[dict]) -> dict:
    db: Session = next(get_db())
    quiz = Quiz(lesson_id=lesson_id, title=title)
    db.add(quiz)
    db.flush()
    for q_data in questions:
        question = QuizQuestion(quiz_id=quiz.id, prompt=q_data["prompt"])
        db.add(question)
        db.flush()
        for opt in q_data.get("options", []):
            option = QuizOption(question_id=question.id, text=opt["text"], is_correct=opt.get("is_correct", False))
            db.add(option)
    db.commit()
    return {"id": quiz.id, "lesson_id": lesson_id, "title": title}


def get_quiz_for_lesson(lesson_id: str) -> dict | None:
    db: Session = next(get_db())
    quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first()
    if not quiz:
        return None
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).all()
    return {
        "id": quiz.id,
        "lesson_id": quiz.lesson_id,
        "title": quiz.title,
        "questions": [
            {
                "id": q.id,
                "prompt": q.prompt,
                "options": [
                    {"id": o.id, "text": o.text}
                    for o in db.query(QuizOption).filter(QuizOption.question_id == q.id).all()
                ],
            }
            for q in questions
        ],
    }


def grade_attempt(quiz_id: str, answers: dict) -> dict:
    db: Session = next(get_db())
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    total = len(questions)
    correct = 0
    for q in questions:
        correct_option = db.query(QuizOption).filter(QuizOption.question_id == q.id, QuizOption.is_correct).first()
        if correct_option and answers.get(q.id) == correct_option.id:
            correct += 1
    percentage = (correct / total * 100) if total > 0 else 0
    return {"quiz_id": quiz_id, "score": correct, "total": total, "percentage": round(percentage, 2)}
