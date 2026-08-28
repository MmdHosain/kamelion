from django.db import models


class SiteSetting(models.Model):
    """
    Generic single-row-per-key site settings store.
    Currently used for the global theme, but kept generic (key/value)
    so future site-wide settings don't need a new model each time.
    """
    THEME_CHOICES = [
        ("pink", "Pink"),
        ("lilac", "Lilac"),
        ("purple", "Purple"),
    ]

    THEME_KEY = "theme"

    key = models.CharField(max_length=50, unique=True)
    value = models.CharField(max_length=100)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}={self.value}"

    @classmethod
    def get_theme(cls):
        obj = cls.objects.filter(key=cls.THEME_KEY).first()
        return obj.value if obj else "pink"

    @classmethod
    def set_theme(cls, theme_key):
        obj, _ = cls.objects.update_or_create(
            key=cls.THEME_KEY,
            defaults={"value": theme_key},
        )
        return obj.value


class Video(models.Model):
    """
    Educational/clinical video gallery:
    GET /api/videos/, POST /api/admin/videos/, DELETE /api/admin/videos/<id>/
    """
    VIDEO = "video"
    IFRAME = "iframe"
    TYPE_CHOICES = [
        (VIDEO, "Direct video file (mp4 etc.)"),
        (IFRAME, "Embedded iframe (e.g. YouTube)"),
    ]

    title = models.CharField(max_length=255)
    src = models.CharField(max_length=500)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=VIDEO)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
