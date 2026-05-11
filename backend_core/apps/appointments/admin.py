from django.contrib import admin
from .models import DoctorAvailability, AvailabilityException, Appointment


admin.site.register(DoctorAvailability)
admin.site.register(AvailabilityException)
admin.site.register(Appointment)
