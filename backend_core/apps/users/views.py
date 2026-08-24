from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .serializers import (
    RequestOTPSerializer,
    VerifyOTPSerializer,
    AdminLoginSerializer,
    RefreshTokenSerializer,
)
from .services import request_otp, verify_otp
from .selectors import get_patient_profile
from django.contrib.auth import authenticate



class RequestOTPView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = RequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]

        request_otp(phone_number)

        return Response(
            {"message": "OTP sent"},
            status=status.HTTP_200_OK
        )


class VerifyOTPView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        code = serializer.validated_data["code"]

        # accept either "full_name" or "name" from the client -
        # the frontend currently sends "name"
        full_name = (
            serializer.validated_data.get("full_name")
            or request.data.get("name")
        )

        try:
            user = verify_otp(phone_number, code, full_name=full_name)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "phone_number": user.phone_number,
                "full_name": user.full_name,
                "role": "admin" if user.is_staff else "patient"
            }
        })


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