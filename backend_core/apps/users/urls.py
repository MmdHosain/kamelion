from django.urls import path

from .views import RequestOTPView, VerifyOTPView, AdminLoginView


urlpatterns = [
    path("auth/request-otp", RequestOTPView.as_view()),
    path("auth/verify-otp", VerifyOTPView.as_view()),
    path("auth/admin/login", AdminLoginView.as_view()),
]
