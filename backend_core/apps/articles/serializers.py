from django.core.files.base import ContentFile
from rest_framework import serializers

from . import services
from .models import Article, Category

RESERVED_SLUGS = {"categories", "upload-image"}


class CategoryMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class ArticleListSerializer(serializers.ModelSerializer):
    category = CategoryMiniSerializer(read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image",
            "category",
            "author_name",
            "reading_time_minutes",
            "created_at",
            "published_at",
        ]

    def get_author_name(self, obj):
        return (obj.author.full_name or "") if obj.author else ""


class ArticleDetailSerializer(ArticleListSerializer):
    author = serializers.SerializerMethodField()

    class Meta(ArticleListSerializer.Meta):
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "video_embed_url",
            "category",
            "author",
            "reading_time_minutes",
            "views_count",
            "created_at",
            "updated_at",
            "published_at",
        ]

    def get_author(self, obj):
        if not obj.author:
            return None
        return {"id": obj.author.id, "full_name": obj.author.full_name or ""}


class ArticleAdminWriteSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(max_length=280, allow_unicode=True, required=False)
    reading_time_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "video_embed_url",
            "category",
            "status",
            "reading_time_minutes",
            "published_at",
        ]
        read_only_fields = ["published_at"]

    def validate_slug(self, value):
        if value in RESERVED_SLUGS:
            raise serializers.ValidationError("این نامک رزرو شده است.")
        return value

    def validate_content(self, value):
        return services.sanitize_html(value)

    def validate_video_embed_url(self, value):
        url = services.normalize_video_url(value)
        if url and not services.is_allowed_video_url(url):
            raise serializers.ValidationError(
                "فقط لینک ویدیوی آپارات یا یوتیوب مجاز است."
            )
        return url

    def validate_cover_image(self, value):
        try:
            content, name = services.optimize_image(value)
        except services.ImageValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return ContentFile(content.read(), name=name)

    def _fill_derived(self, validated):
        if "content" in validated:
            validated["reading_time_minutes"] = services.estimate_reading_time(
                validated["content"]
            )
        return validated

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = _unique_slug(validated_data["title"])
        return super().create(self._fill_derived(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._fill_derived(validated_data))


def _unique_slug(title):
    from django.utils.text import slugify

    base = slugify(title, allow_unicode=True)[:250] or "article"
    if base in RESERVED_SLUGS:
        base = f"{base}-article"
    slug, n = base, 2
    while Article.objects.filter(slug=slug).exists():
        slug, n = f"{base}-{n}", n + 1
    return slug
