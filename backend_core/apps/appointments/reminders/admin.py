from django.contrib import admin

from .models import AppointmentReminder


@admin.register(AppointmentReminder)
class AppointmentReminderAdmin(admin.ModelAdmin):
    list_display = ("id", "appointment", "scheduled_for", "status", "attempted_at")
    list_filter = ("status", "appointment_date")
    search_fields = ("appointment__user__full_name", "appointment__user__phone_number")
    readonly_fields = tuple(field.name for field in AppointmentReminder._meta.fields)
    actions = None

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
