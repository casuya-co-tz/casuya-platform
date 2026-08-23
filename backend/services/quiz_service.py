import hashlib
import uuid
from pathlib import Path

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.settings import get_settings
from backend.models.quiz import Quiz, QuizOption, QuizQuestion

settings = get_settings()


def _get_quiz_pkg_path(slug: str) -> Path:
    storage = Path(settings.storage_root) / "quiz-packages"
    if len(slug) < 4:
        return storage / f"{slug}.html"
    return storage / slug[:2] / slug[2:4] / f"{slug}.html"


def create_quiz(lesson_id: str, title: str, questions: list[dict]) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
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
    finally:
        _gen.close()


def create_quiz_from_html(lesson_id: str | None, title: str, html: str) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        slug = title.lower().replace(" ", "-") + "-" + uuid.uuid4().hex[:8]
        content_hash = hashlib.sha256(html.encode()).hexdigest()
        quiz = Quiz(lesson_id=lesson_id, title=title, slug=slug, content_hash=content_hash)
        db.add(quiz)
        db.flush()
        pkg_path = _get_quiz_pkg_path(slug)
        pkg_path.parent.mkdir(parents=True, exist_ok=True)
        pkg_path.write_text(html, encoding="utf-8")
        db.commit()
        return {"id": quiz.id, "slug": slug, "title": title, "content_hash": content_hash, "status": "draft"}
    finally:
        _gen.close()


def list_quizzes() -> list[dict]:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        quizzes = db.query(Quiz).all()
        counts = dict(db.query(QuizQuestion.quiz_id, func.count(QuizQuestion.id)).group_by(QuizQuestion.quiz_id).all())
        return [
            {
                "id": q.id,
                "lesson_id": q.lesson_id,
                "title": q.title,
                "slug": q.slug,
                "status": q.status,
                "content_hash": q.content_hash,
                "question_count": counts.get(q.id, 0),
            }
            for q in quizzes
        ]
    finally:
        _gen.close()


def get_quiz(quiz_id: str) -> dict | None:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return None
        questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).all()
        return {
            "id": quiz.id,
            "lesson_id": quiz.lesson_id,
            "title": quiz.title,
            "slug": quiz.slug,
            "content_hash": quiz.content_hash,
            "status": quiz.status,
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
    finally:
        _gen.close()


def get_quiz_for_lesson(lesson_id: str) -> dict | None:
    _gen = get_db()
    db: Session = next(_gen)
    try:
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
    finally:
        _gen.close()


def read_quiz_content(slug: str) -> str | None:
    pkg_path = _get_quiz_pkg_path(slug)
    if not pkg_path.exists():
        return None
    return pkg_path.read_text(encoding="utf-8")


def publish_quiz(quiz_id: str) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")
        quiz.status = "published"
        db.commit()
        return {"id": quiz.id, "slug": quiz.slug, "status": "published"}
    finally:
        _gen.close()


def delete_quiz(quiz_id: str) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")
        slug = quiz.slug
        db.delete(quiz)
        db.commit()
        if slug:
            pkg_path = _get_quiz_pkg_path(slug)
            if pkg_path.exists():
                pkg_path.unlink()
        return {"detail": "Quiz deleted"}
    finally:
        _gen.close()


def update_quiz(quiz_id: str, title: str | None = None, html: str | None = None) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")
        if title is not None:
            quiz.title = title
        if html is not None:
            content_hash = hashlib.sha256(html.encode()).hexdigest()
            quiz.content_hash = content_hash
            pkg_path = _get_quiz_pkg_path(quiz.slug)
            pkg_path.parent.mkdir(parents=True, exist_ok=True)
            pkg_path.write_text(html, encoding="utf-8")
        db.commit()
        return {"id": quiz.id, "slug": quiz.slug, "title": quiz.title, "status": quiz.status}
    finally:
        _gen.close()


def grade_attempt(quiz_id: str, answers: dict, work: dict | None = None) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
        total = len(questions)
        correct = 0
        for q in questions:
            correct_option = db.query(QuizOption).filter(QuizOption.question_id == q.id, QuizOption.is_correct).first()
            if correct_option and answers.get(q.id) == correct_option.id:
                correct += 1
        percentage = (correct / total * 100) if total > 0 else 0

        # --- Show-your-work grading (presence-based, not OCR-dependent) ---
        # work: { questionId: { elements:[], hasWork:bool, recognizedLatex:str, elements_json:str } }
        work_score = None
        work_percentage = None
        combined_percentage = None
        if work is not None:
            work_score = 0
            for q in questions:
                snap = work.get(q.id) or work.get(str(q.id))
                has = False
                if isinstance(snap, dict):
                    if snap.get("hasWork") is True or (isinstance(snap.get("elements"), list) and len(snap["elements"]) > 0):
                        has = True
                    elif isinstance(snap.get("recognizedLatex"), str) and snap["recognizedLatex"].strip() not in ("", "__drawing__"):
                        # text work counts; drawings also count via elements/hasWork above
                        has = True
                    elif snap.get("recognizedLatex") == "__drawing__" or (isinstance(snap.get("elements_json"), str) and len(snap["elements_json"].strip()) > 4):
                        has = True
                elif (isinstance(snap, list) and len(snap) > 0) or snap is True:
                    has = True
                if has:
                    work_score += 1
            work_percentage = round((work_score / total * 100) if total > 0 else 0, 2)
            # Weighted merge: 70% answers + 30% work (as per PLAN). If total==0, just use answer pct.
            combined_percentage = round(percentage * 0.7 + work_percentage * 0.3, 2) if total > 0 else round(percentage, 2)
            return {
                "quiz_id": quiz_id,
                "score": correct,
                "total": total,
                "percentage": round(percentage, 2),
                "work_score": work_score,
                "work_total": total,
                "work_percentage": work_percentage,
                "combined_percentage": combined_percentage,
            }

        return {"quiz_id": quiz_id, "score": correct, "total": total, "percentage": round(percentage, 2)}
    finally:
        _gen.close()
