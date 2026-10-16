from django.contrib import admin

from .models import ChatMessage, ChatSession, TriageAction


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    can_delete = False
    fields = ("created_at", "role", "kind", "content")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


class TriageActionInline(admin.TabularInline):
    model = TriageAction
    extra = 0
    can_delete = False
    fields = ("created_at", "level", "kind", "emergency_code")
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ("session_id", "user", "triage_level", "updated_at")
    list_filter = ("triage_level",)
    search_fields = ("session_id", "user__phone_number", "user__full_name")
    readonly_fields = ("ai_session_id", "triage_level", "triage_summary", "created_at", "updated_at")
    inlines = [TriageActionInline, ChatMessageInline]
