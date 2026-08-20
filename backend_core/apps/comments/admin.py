from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "created_at", "reviewed_by", "reviewed_at")
    list_filter = ("status",)
    search_fields = ("text", "user__phone_number", "user__full_name")
