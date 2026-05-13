from .models import PatientProfile


def get_patient_profile(user):
    profile, _ = PatientProfile.objects.get_or_create(user=user)
    return profile
