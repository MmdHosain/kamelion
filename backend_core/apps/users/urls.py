from django.urls import path

from .views import RequestOTPView, VerifyOTPView, MeView


urlpatterns = [
    path("auth/request-otp", RequestOTPView.as_view()),
    path("auth/verify-otp", VerifyOTPView.as_view()),
    path("me", MeView.as_view()),
]
