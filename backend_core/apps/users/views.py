from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RequestOTPSerializer, VerifyOTPSerializer
from .services import request_otp, verify_otp


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

        try:
            user = verify_otp(phone_number, code)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })
