from django.contrib import admin
from .models import User, PatientProfile, PatientNote

admin.site.register(User)
admin.site.register(PatientProfile)
admin.site.register(PatientNote)
