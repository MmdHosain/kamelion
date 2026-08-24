from django.urls import path
from .views_admin import (
    AdminPatientListView,
    AdminPatientDetailView,
    AdminPatientNoteCreateView,
)

urlpatterns = [
    path("patients/", AdminPatientListView.as_view()),
    path("patients/<int:pk>/", AdminPatientDetailView.as_view()),
    path("patients/<int:pk>/notes/", AdminPatientNoteCreateView.as_view()),
]
