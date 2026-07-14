import functools
import hashlib
import json
import re
import time
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from backend.config.database import get_db, get_engine
from backend.config.settings import get_settings
from backend.models.lesson import Lesson
from backend.models.lesson_version import LessonVersion

settings = get_settings()

# ── In-memory content cache ──
CONTENT_CACHE_TTL = 300  # 5 minutes
content_cache: dict[str, tuple[float, str]] = {}


def _cache_get(key: str) -> str | None:
    entry = content_cache.get(key)
    if entry and (time.monotonic() - entry[0]) < CONTENT_CACHE_TTL:
        return entry[1]
    if entry:
        del content_cache[key]
    return None


def _cache_set(key: str, value: str):
    content_cache[key] = (time.monotonic(), value)
    # Evict oldest if cache exceeds 10k entries
    if len(content_cache) > 10000:
        oldest = min(content_cache.items(), key=lambda x: x[1][0])
        del content_cache[oldest[0]]


# ── Sharded package paths ──
def get_package_path(slug: str) -> Path:
    storage = Path(settings.storage_root) / "lesson-packages"
    if len(slug) < 4:
        return storage / f"{slug}.html"
    return storage / slug[:2] / slug[2:4] / f"{slug}.html"


def _migrate_old_package(slug: str) -> str | None:
    """Migrate old flat JSON package to new sharded HTML format, return HTML content."""
    old_path = Path(settings.storage_root) / "lesson-packages" / f"{slug}.json"
    if not old_path.exists():
        return None
    try:
        pkg = json.loads(old_path.read_text(encoding="utf-8"))
        html = pkg.get("html", "")
        new_path = get_package_path(slug)
        new_path.parent.mkdir(parents=True, exist_ok=True)
        new_path.write_text(html, encoding="utf-8")
        old_path.unlink()  # remove old format after migration
        return html
    except Exception:
        return None


# ── LaTeX detection & KaTeX injection ──
_LATEX_PATTERNS: list[re.Pattern[str]] | None = None


def _compile_latex_patterns():
    global _LATEX_PATTERNS
    if _LATEX_PATTERNS is not None:
        return
    _LATEX_PATTERNS = [
        re.compile(r"\$\$[^$]+\$\$"),
        re.compile(r"\$[^$\n]+\$"),
        re.compile(r"\\\[[^\\]+\\\]"),
        re.compile(r"\\\([^\\]+\\\)"),
    ]


def _has_latex(html: str) -> bool:
    _compile_latex_patterns()
    if _LATEX_PATTERNS is None:
        return False
    return any(p.search(html) for p in _LATEX_PATTERNS)


def _has_mathjax(html: str) -> bool:
    return any(
        marker in html
        for marker in ["mathjax", "MathJax", "tex-mml-chtml", "cdn.jsdelivr.net/npm/mathjax"]
    )


def _clean_mathjax_broken_katex(html: str) -> str:
    html = re.sub(r'<link[^>]*katex[^>]*>', '', html)
    html = re.sub(r'<script[^>]*katex[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    return html


def _optimize_math_injection(html: str) -> str:
    if not _has_latex(html):
        return html

    if _has_mathjax(html):
        return _clean_mathjax_broken_katex(html)

    katex_css = '<link rel="stylesheet" href="/static/lib/katex/katex.min.css" crossorigin="anonymous">'
    katex_js = '<script src="/static/lib/katex/katex.min.js" crossorigin="anonymous"><\/script>'
    auto_render_js = '<script src="/static/lib/katex/contrib/auto-render.min.js" crossorigin="anonymous"><\/script>'
    render_call = (
        '<script>'
        'document.addEventListener("DOMContentLoaded",function(){'
        'if(typeof renderMathInElement==="function"){'
        'renderMathInElement(document.body,{delimiters:['
        '{left:"$$",right:"$$",display:true},'
        '{left:"$",right:"$",display:false},'
        '{left:"\\\\[",right:"\\\\]",display:true},'
        '{left:"\\\\(",right:"\\\\)",display:false}'
        ']});'
        '}'
        '});'
        '<\/script>'
    )

    has_head = "<head>" in html.lower()
    has_body_close = "</body>" in html.lower()
    has_doctype = html.strip().upper().startswith("<!DOCTYPE")

    if not has_head and not has_body_close and not has_doctype:
        html = (
            "<!DOCTYPE html><html><head>"
            "<meta charset='UTF-8'>"
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
            + katex_css +
            "</head><body>"
            + html +
            katex_js + auto_render_js + render_call +
            "</body></html>"
        )
        return html

    if has_head:
        html = html.replace("<head>", "<head>" + katex_css, 1)
    else:
        html = katex_css + html

    katex_scripts = katex_js + auto_render_js + render_call

    if has_body_close:
        html = html.replace("</body>", katex_scripts + "</body>", 1)
    else:
        html += katex_scripts

    return html


def _inject_katex(html: str) -> str:
    return _optimize_math_injection(html)


def read_lesson_content(slug: str) -> str | None:
    cached = _cache_get(slug)
    if cached is not None:
        return cached

    new_path = get_package_path(slug)
    if new_path.exists():
        html = new_path.read_text(encoding="utf-8")
    else:
        html = _migrate_old_package(slug)
        if html is None:
            return None

    html = _inject_katex(html)
    _cache_set(slug, html)
    return html


def create_lesson_from_html(subtopic_id: str, title: str, html: str) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        slug = title.lower().replace(" ", "-") + "-" + uuid.uuid4().hex[:8]
        content_hash = hashlib.sha256(html.encode()).hexdigest()
        lesson = Lesson(
            subtopic_id=subtopic_id,
            slug=slug,
            title=title,
            content_hash=content_hash,
        )
        db.add(lesson)
        db.flush()
        pkg_path = get_package_path(slug)
        pkg_path.parent.mkdir(parents=True, exist_ok=True)
        pkg_path.write_text(html, encoding="utf-8")
        version = LessonVersion(
            lesson_id=lesson.id,
            package_version="1.0.0",
            content_hash=content_hash,
            package_path=str(pkg_path),
        )
        db.add(version)
        db.commit()
        return {
            "id": lesson.id,
            "slug": slug,
            "title": title,
            "content_hash": content_hash,
            "package_version": "1.0.0",
            "status": "draft",
        }
    finally:
        _gen.close()


def publish_lesson(lesson_id: str) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise ValueError("Lesson not found")
        lesson.status = "published"
        db.commit()
        return {"id": lesson.id, "slug": lesson.slug, "status": "published"}
    finally:
        _gen.close()


def delete_lesson(lesson_id: str) -> dict:
    engine = get_engine()
    raw_conn = engine.raw_connection()
    try:
        cur = raw_conn.cursor()
        cur.execute("SELECT slug FROM lessons WHERE id = %s", (lesson_id,))
        row = cur.fetchone()
        if not row:
            raise ValueError("Lesson not found")
        slug = row[0]

        cur.execute("DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id = %s))", (lesson_id,))
        cur.execute("DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id = %s)", (lesson_id,))
        cur.execute("DELETE FROM quizzes WHERE lesson_id = %s", (lesson_id,))
        cur.execute("DELETE FROM lesson_versions WHERE lesson_id = %s", (lesson_id,))
        cur.execute("DELETE FROM progress_records WHERE lesson_id = %s", (lesson_id,))
        cur.execute("DELETE FROM lesson_analytics_snapshots WHERE lesson_id = %s", (lesson_id,))
        cur.execute("DELETE FROM bookmarks WHERE lesson_id = %s", (lesson_id,))
        cur.execute("DELETE FROM notes WHERE lesson_id = %s", (lesson_id,))
        cur.execute("DELETE FROM games WHERE lesson_id = %s", (lesson_id,))
        cur.execute("DELETE FROM lessons WHERE id = %s", (lesson_id,))
        raw_conn.commit()
        cur.close()

        if slug:
            pkg_path = get_package_path(slug)
            if pkg_path.exists():
                pkg_path.unlink()
        return {"detail": "Lesson deleted"}
    except Exception:
        raw_conn.rollback()
        raise
    finally:
        raw_conn.close()


def get_lesson(lesson_id: str) -> dict | None:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return None
        return {
            "id": lesson.id,
            "subtopic_id": lesson.subtopic_id,
            "slug": lesson.slug,
            "title": lesson.title,
            "content_hash": lesson.content_hash,
            "package_version": lesson.package_version,
            "status": lesson.status,
        }
    finally:
        _gen.close()


def update_lesson(lesson_id: str, title: str | None = None, html: str | None = None) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise ValueError("Lesson not found")
        if title is not None:
            lesson.title = title
        if html is not None:
            content_hash = hashlib.sha256(html.encode()).hexdigest()
            lesson.content_hash = content_hash
            pkg_path = get_package_path(lesson.slug)
            pkg_path.parent.mkdir(parents=True, exist_ok=True)
            pkg_path.write_text(html, encoding="utf-8")
            version = LessonVersion(
                lesson_id=lesson.id,
                package_version="1.0.0",
                content_hash=content_hash,
                package_path=str(pkg_path),
            )
            db.add(version)
            if lesson.slug in content_cache:
                del content_cache[lesson.slug]
        db.commit()
        return {"id": lesson.id, "slug": lesson.slug, "title": lesson.title, "status": lesson.status}
    finally:
        _gen.close()


def list_lessons(subtopic_id: str | None = None, status: str | None = None, skip: int = 0, limit: int = 100) -> list[dict]:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        query = db.query(Lesson)
        if subtopic_id:
            query = query.filter(Lesson.subtopic_id == subtopic_id)
        if status:
            query = query.filter(Lesson.status == status)
        lessons = query.offset(skip).limit(limit).all()
        return [
            {
                "id": l.id,
                "subtopic_id": l.subtopic_id,
                "slug": l.slug,
                "title": l.title,
                "status": l.status,
            }
            for l in lessons
        ]
    finally:
        _gen.close()
