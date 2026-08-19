from django.urls import path
from .views_admin import (
    AdminCommentListView,
    AdminCommentApproveView,
    AdminCommentRejectView,
    AdminCommentDeleteView,
)

urlpatterns = [
    path("", AdminCommentListView.as_view()),
    path("<int:pk>/approve/", AdminCommentApproveView.as_view()),
    path("<int:pk>/reject/", AdminCommentRejectView.as_view()),
    path("<int:pk>/", AdminCommentDeleteView.as_view()),
]
