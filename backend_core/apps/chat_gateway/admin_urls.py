from django.urls import path

from .views_admin import (
    AdminPatientChatsView,
    AdminPatientTriageLevelView,
    AdminResetChatSessionView,
    AdminTestChatMessageView,
)

# Included under /api/admin/ in config/urls.py.
urlpatterns = [
    path("patients/<int:pk>/chats/", AdminPatientChatsView.as_view()),
    path("patients/<int:pk>/triage_level/", AdminPatientTriageLevelView.as_view()),
    path("chat/test/message/", AdminTestChatMessageView.as_view(), name="admin-chat-test-message"),
    path("chat/test/reset/", AdminResetChatSessionView.as_view(), name="admin-chat-test-reset"),
]
