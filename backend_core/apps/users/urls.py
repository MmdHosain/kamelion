from django.urls import path

from .views import (
    RequestOTPView,
    VerifyOTPView,
    CompleteRegistrationView,
    AdminLoginView,
    CurrentUserView,
    RefreshTokenView,
    LogoutView,
)


urlpatterns = [
    path("auth/request-otp", RequestOTPView.as_view()),
    path("auth/verify-otp", VerifyOTPView.as_view()),
    path("auth/complete-registration", CompleteRegistrationView.as_view()),
    path("auth/admin/login", AdminLoginView.as_view()),
    path("auth/me", CurrentUserView.as_view()),
    path("auth/refresh", RefreshTokenView.as_view()),
    path("auth/logout", LogoutView.as_view()),
]