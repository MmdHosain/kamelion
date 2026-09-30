from django.contrib import admin
from .models import User, PatientNote

admin.site.register(User)
admin.site.register(PatientNote)
