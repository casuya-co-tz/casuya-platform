import re
from backend.config.database import get_db
from backend.models.lesson import Lesson

db = next(get_db())
all_lessons = db.query(Lesson).all()
for lesson in all_lessons:
    print(f"ID: {lesson.id}, Slug: {lesson.slug}, Title: {lesson.title}")
