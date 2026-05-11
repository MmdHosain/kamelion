from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView

from .models import DoctorAvailability, AvailabilityException, Appointment
from .serializers import (
    DoctorAvailabilitySerializer,
    AvailabilityExceptionSerializer,
    AppointmentSerializer,
)
from .pagination import AppointmentPagination


class AdminSlotViewSet(viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all()
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAdminUser]


class AdminExceptionViewSet(viewsets.ModelViewSet):
    queryset = AvailabilityException.objects.all()
    serializer_class = AvailabilityExceptionSerializer
    permission_classes = [IsAdminUser]


class AdminAppointmentsView(ListAPIView):
    queryset = Appointment.objects.all().order_by("-id")
    serializer_class = AppointmentSerializer
    pagination_class = AppointmentPagination
    permission_classes = [IsAdminUser]
