from django.urls import path
from .views_admin import AdminReviewListView, AdminReviewApprovalView

urlpatterns = [
    path("", AdminReviewListView.as_view()),
    path("<int:pk>/", AdminReviewApprovalView.as_view()),
    path("<int:pk>/approval/", AdminReviewApprovalView.as_view()),
]
