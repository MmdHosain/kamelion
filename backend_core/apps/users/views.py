from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .serializers import (
    RequestOTPSerializer,
    VerifyOTPSerializer,
    CompleteRegistrationSerializer,
    AdminLoginSerializer,
    RefreshTokenSerializer,
)
from .services import request_otp, verify_otp, complete_registration
from .models import User
from apps.common.panelchi import SmsProviderError
from django.contrib.auth import authenticate



class RequestOTPView(APIView):
    """
    Step 0 of login: the user just typed their phone number, before
    any OTP is involved.

    - If that phone number belongs to an admin (is_staff), no OTP is
      sent at all - the response tells the frontend to show the
      admin password screen instead, which then calls
      /api/auth/admin/login with phone_number + password.
    - Otherwise, this behaves as before: an OTP is generated and
      sent (via whatever SMS_PROVIDER is configured), and the normal
      verify-otp -> (complete-registration) flow continues.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = RequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]

        is_admin = User.objects.filter(
            phone_number=phone_number,
            is_staff=True
        ).exists()

        if is_admin:
            # Don't send an OTP for admin numbers - they authenticate
            # with a password instead.
            return Response(
                {"is_admin": True, "message": "Enter your password"},
                status=status.HTTP_200_OK
            )

        try:
            request_otp(phone_number)

        except SmsProviderError as e:
            # Don't claim success when the code was never actually
            # delivered.
            return Response(
                {"error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response(
            {"is_admin": False, "message": "OTP sent"},
            status=status.HTTP_200_OK
        )


def _login_response(user):
    """
    Shared shape for a successful login - used by both VerifyOTPView
    (returning users) and CompleteRegistrationView (first-time users
    who just finished signup).
    """
    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "phone_number": user.phone_number,
            "full_name": user.full_name,
            "national_id": user.national_id,
            "sex": user.sex,
            "date_of_birth": user.date_of_birth,
            "role": "admin" if user.is_staff else "patient"
        }
    })


class VerifyOTPView(APIView):
    """
    Step 1 of login: confirm the OTP code. This is a complete,
    self-contained check - once the code is right, the phone number
    is verified and the OTP is consumed, independent of anything
    that follows.

    Response is one of two shapes:
    - Phone number already has an account -> logged straight in
      (same shape as AdminLoginView: access/refresh/user).
    - First time seeing this phone number -> {"registration_required":
      true, "signup_token": "..."}. The frontend then collects
      full_name + national_id (plus optional sex and date_of_birth) and
      calls /auth/complete-registration with that token.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        code = serializer.validated_data["code"]

        try:
            kind, value = verify_otp(phone_number, code)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        if kind == "user":
            return _login_response(value)

        # kind == "signup_token" - first time for this phone number
        return Response({
            "registration_required": True,
            "signup_token": value,
        }, status=status.HTTP_200_OK)


class CompleteRegistrationView(APIView):
    """
    Step 2 of login, first-time patients only.
    POST /api/auth/complete-registration
    {signup_token, full_name, national_id, sex?, date_of_birth?}
    sex is "female" or "male"; date_of_birth is YYYY-MM-DD. Both optional.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = CompleteRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = complete_registration(
                token=serializer.validated_data["signup_token"],
                full_name=serializer.validated_data["full_name"],
                national_id=serializer.validated_data["national_id"],
                sex=serializer.validated_data.get("sex"),
                date_of_birth=serializer.validated_data.get("date_of_birth"),
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return _login_response(user)


class CurrentUserView(APIView):
    """
    Returns the currently authenticated user, resolved from the
    JWT access token. Used by the frontend on page load/refresh to
    restore session state without requiring a fresh login.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "phone_number": user.phone_number,
            "full_name": user.full_name,
            "national_id": user.national_id,
            "sex": user.sex,
            "date_of_birth": user.date_of_birth,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "role": "admin" if user.is_staff else "patient"
        })

class AdminLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        password = serializer.validated_data["password"]

        user = authenticate(
            request,
            username=phone_number,
            password=password
        )

        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_staff:
            return Response(
                {"detail": "User is not admin"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not user.is_active:
            return Response(
                {"detail": "User is inactive"},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "accessToken": str(refresh.access_token),
            "refreshToken": str(refresh),
            "user": {
                "id": user.id,
                "phone_number": user.phone_number,
                "full_name": user.full_name,
                "role": "admin"
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_refresh = request.data.get("refreshToken") or request.data.get("refresh")
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                # Already invalid/expired/blacklisted - logout still succeeds
                pass

        return Response({"message": "Logged out"}, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_refresh = serializer.validated_data["refreshToken"]

        try:
            refresh = RefreshToken(raw_refresh)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        new_access = str(refresh.access_token)

        # SIMPLE_JWT['ROTATE_REFRESH_TOKENS'] is not enabled in settings.py,
        # so the same refresh token is valid until its own expiry and is
        # simply echoed back rather than rotated.
        return Response({
            "accessToken": new_access,
            "refreshToken": raw_refresh,
        }, status=status.HTTP_200_OK)