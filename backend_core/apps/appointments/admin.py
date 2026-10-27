from django.contrib import admin
from .models import DoctorAvailability, AvailabilityException, Appointment
from .services import approve_appointment
from .reminders import admin as reminder_admin  # noqa: F401


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "appointment_date", "appointment_time", "status", "disapproval_reason", "created_at")
    list_filter = ("status",)
    search_fields = ("user__full_name", "user__phone_number")
    actions = ["approve_selected"]

    @admin.action(description="Approve selected pending appointments")
    def approve_selected(self, request, queryset):
        approved = 0
        for appointment in queryset:
            try:
                approve_appointment(appointment)
                approved += 1
            except ValueError:
                pass
        self.message_user(request, f"{approved} appointment(s) approved.")


admin.site.register(DoctorAvailability)
admin.site.register(AvailabilityException)
