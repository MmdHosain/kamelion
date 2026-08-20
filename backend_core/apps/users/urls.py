from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RequestOTPView, VerifyOTPView, AdminLoginView, CurrentUserView


urlpatterns = [
    path("auth/request-otp", RequestOTPView.as_view()),
    path("auth/verify-otp", VerifyOTPView.as_view()),
    path("auth/admin/login", AdminLoginView.as_view()),
    path("auth/me", CurrentUserView.as_view()),
    path("auth/refresh", TokenRefreshView.as_view()),
]