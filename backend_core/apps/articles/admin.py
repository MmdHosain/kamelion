from django.contrib import admin

from .models import Article, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "status",
        "category",
        "author",
        "reading_time_minutes",
        "views_count",
        "published_at",
        "created_at",
    )
    list_filter = ("status", "category")
    search_fields = ("title", "slug", "excerpt")
    readonly_fields = (
        "views_count",
        "reading_time_minutes",
        "published_at",
        "created_at",
        "updated_at",
    )
    raw_id_fields = ("author", "category")
