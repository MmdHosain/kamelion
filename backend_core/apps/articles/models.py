from django.conf import settings
from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="نام دسته‌بندی")
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True)
    description = models.TextField(blank=True, default="", verbose_name="توضیحات کوتاه")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "دسته‌بندی مقاله"
        verbose_name_plural = "دسته‌بندی‌های مقالات"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Article(models.Model):
    DRAFT = "draft"
    PUBLISHED = "published"
    STATUS_CHOICES = [(DRAFT, "پیش‌نویس"), (PUBLISHED, "منتشرشده")]

    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    slug = models.SlugField(max_length=280, unique=True, allow_unicode=True)
    excerpt = models.TextField(max_length=600, blank=True, default="")
    content = models.TextField(verbose_name="متن کامل (HTML ضدعفونی‌شده)")
    cover_image = models.ImageField(
        upload_to="articles/covers/%Y/%m/", null=True, blank=True
    )
    video_embed_url = models.CharField(max_length=500, blank=True, default="")

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articles",
    )
    # SET_NULL: deleting a user account must not delete their articles.
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="articles",
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    reading_time_minutes = models.PositiveSmallIntegerField(default=1)
    views_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)  # first publication time

    class Meta:
        verbose_name = "مقاله پزشکی"
        verbose_name_plural = "مقالات پزشکی"
        ordering = ["-published_at", "-created_at"]
        # slug is already unique -> no separate index needed.
        indexes = [models.Index(fields=["status", "-published_at"])]

    def save(self, *args, **kwargs):
        if self.status == self.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
