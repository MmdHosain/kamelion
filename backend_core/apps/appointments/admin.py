from django.contrib import admin
from .models import DoctorAvailability, AvailabilityException, Appointment


@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("day_of_week", "start_time", "end_time", "visit_duration", "time_gap", "is_active")
    list_filter = ("day_of_week", "is_active")


@admin.register(AvailabilityException)
class AvailabilityExceptionAdmin(admin.ModelAdmin):
    list_display = ("date", "is_closed", "start_time", "end_time")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "appointment_date", "appointment_time", "status")
    list_filter = ("status", "appointment_date")
