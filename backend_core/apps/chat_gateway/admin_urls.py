from django.urls import path

from .views_admin import AdminPatientChatsView, AdminPatientTriageLevelView

# Included under /api/admin/ in config/urls.py.
urlpatterns = [
    path("patients/<int:pk>/chats/", AdminPatientChatsView.as_view()),
    path("patients/<int:pk>/triage_level/", AdminPatientTriageLevelView.as_view()),
]
