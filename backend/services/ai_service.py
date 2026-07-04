import re


def generate_quiz_questions(lesson_html: str, count: int = 5) -> list[dict]:
    text = re.sub(r"<[^>]+>", " ", lesson_html)
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 20]
    questions = []
    for i, sentence in enumerate(sentences[:count]):
        words = sentence.split()
        if len(words) < 4:
            continue
        blank_idx = len(words) // 2
        answer = words[blank_idx]
        words[blank_idx] = "______"
        prompt = " ".join(words)
        questions.append({
            "prompt": prompt,
            "options": [
                {"text": answer, "is_correct": True},
                {"text": answer.upper(), "is_correct": False},
                {"text": answer.lower(), "is_correct": False},
                {"text": answer[::-1], "is_correct": False},
            ],
        })
    return questions
