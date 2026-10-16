"""Content sanitization, reading-time estimation, video-URL validation and
image upload optimization for the articles module."""

import io
import math
import os
import re
import uuid
from urllib.parse import urlparse

import nh3
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.html import strip_tags
from PIL import Image, ImageOps, UnidentifiedImageError

# ── HTML sanitization (stored-XSS protection) ─────────────
ALLOWED_TAGS = {
    "p",
    "h2",
    "h3",
    "h4",
    "strong",
    "em",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "br",
    "hr",
    "iframe",
}
ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "target"},  # rel is added by nh3 itself
    "img": {"src", "alt", "title", "width", "height", "loading"},
    "iframe": {"src", "width", "height", "allowfullscreen", "frameborder"},
    "*": {"class"},
}
ALLOWED_VIDEO_HOSTS = {
    "aparat.com",
    "www.aparat.com",
    "www.youtube.com",
    "www.youtube-nocookie.com",
}


def is_allowed_video_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme == "https" and parsed.hostname in ALLOWED_VIDEO_HOSTS


def _attribute_filter(tag, attr, value):
    if tag == "iframe" and attr == "src":
        return value if is_allowed_video_url(value) else None
    if tag == "img" and attr == "src":
        parsed = urlparse(value)
        return (
            value
            if parsed.scheme in ("http", "https") or value.startswith("/media/")
            else None
        )
    return value


def sanitize_html(html: str) -> str:
    return nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes={"http", "https", "mailto"},
        link_rel="noopener noreferrer",
        attribute_filter=_attribute_filter,
    )


def estimate_reading_time(html: str, words_per_minute: int = 200) -> int:
    words = len(strip_tags(html).split())
    return max(1, math.ceil(words / words_per_minute))


_IFRAME_SRC = re.compile(r'<iframe[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)


def normalize_video_url(value: str) -> str:
    """Accepts a plain URL or a pasted <iframe> snippet; returns the URL only ('' if empty)."""
    value = (value or "").strip()
    match = _IFRAME_SRC.search(value)
    return match.group(1) if match else value


# ── Image upload optimization ─────────────────────────────
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_PIXELS = 40_000_000
MAX_WIDTH = 1600
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


class ImageValidationError(ValueError):
    pass


def optimize_image(uploaded_file):
    """Validates the upload and returns (ContentFile as WebP, new random file name)."""
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ALLOWED_EXT:
        raise ImageValidationError(
            "فرمت فایل نامعتبر است. فقط JPG, PNG و WebP مجاز است."
        )
    if uploaded_file.size > MAX_UPLOAD_BYTES:
        raise ImageValidationError("حجم فایل بیشتر از ۵ مگابایت است.")
    try:
        with Image.open(uploaded_file) as probe:
            if probe.format not in ALLOWED_FORMATS:
                raise ImageValidationError("محتوای فایل با فرمت‌های مجاز مطابقت ندارد.")
            if probe.width * probe.height > MAX_PIXELS:
                raise ImageValidationError("ابعاد تصویر بیش از حد بزرگ است.")
            probe.verify()
        uploaded_file.seek(0)
        image = Image.open(uploaded_file)
        image.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise ImageValidationError("فایل، تصویر معتبر نیست.") from exc

    image = ImageOps.exif_transpose(image)  # correct rotation of phone photos
    if image.mode not in ("RGB", "RGBA"):
        has_alpha = "transparency" in image.info or image.mode in ("LA", "PA", "P")
        image = image.convert("RGBA" if has_alpha else "RGB")  # preserve transparency
    if image.width > MAX_WIDTH:
        height = int(image.height * MAX_WIDTH / image.width)
        image = image.resize((MAX_WIDTH, height), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="WEBP", quality=82, method=4)
    return ContentFile(buffer.getvalue()), f"{uuid.uuid4().hex}.webp"


def save_inline_image(uploaded_file, folder="articles/inline"):
    content, name = optimize_image(uploaded_file)
    saved_path = default_storage.save(f"{folder}/{name}", content)  # storage-agnostic
    return default_storage.url(saved_path)
