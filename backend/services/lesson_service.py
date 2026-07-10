import functools
import hashlib
import json
import re
import time
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from backend.config.database import get_db
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


def _inject_katex(html: str) -> str:
    if not _has_latex(html):
        return html
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
    if "<head>" in html:
        html = html.replace("<head>", "<head>" + katex_css)
    else:
        html = katex_css + html
    katex_scripts = katex_js + auto_render_js + render_call
    if "</body>" in html:
        html = html.replace("</body>", katex_scripts + "</body>")
    else:
        html += katex_scripts
    return html


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
    db: Session = next(get_db())
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


def publish_lesson(lesson_id: str) -> dict:
    db: Session = next(get_db())
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError("Lesson not found")
    lesson.status = "published"
    db.commit()
    return {"id": lesson.id, "slug": lesson.slug, "status": "published"}


def delete_lesson(lesson_id: str) -> dict:
    db: Session = next(get_db())
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError("Lesson not found")
    slug = lesson.slug
    db.delete(lesson)
    db.commit()
    if slug:
        pkg_path = get_package_path(slug)
        if pkg_path.exists():
            pkg_path.unlink()
    return {"detail": "Lesson deleted"}


def get_lesson(lesson_id: str) -> dict | None:
    db: Session = next(get_db())
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


def update_lesson(lesson_id: str, title: str | None = None, html: str | None = None) -> dict:
    db: Session = next(get_db())
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


def list_lessons(subtopic_id: str | None = None, status: str | None = None, skip: int = 0, limit: int = 100) -> list[dict]:
    db: Session = next(get_db())
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
