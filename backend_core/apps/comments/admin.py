from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "rating", "status", "created_at", "reviewed_by", "reviewed_at")
    list_filter = ("status", "rating")
    search_fields = ("name", "email", "text")
