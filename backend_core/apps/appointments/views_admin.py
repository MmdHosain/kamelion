from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status

from .models import DoctorAvailability, AvailabilityException, Appointment
from .serializers import (
    DoctorAvailabilitySerializer,
    DoctorAvailabilityBulkSerializer,
    AvailabilityExceptionSerializer,
    AvailabilityExceptionBulkSerializer,
    AppointmentSerializer,
)
from .pagination import AppointmentPagination


class AdminSlotViewSet(viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all().order_by("id")
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

class AdminSlotBulkSaveView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def put(self, request, *args, **kwargs):
        serializer = DoctorAvailabilityBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        schedules = serializer.validated_data["schedules"]
        existing_objects = {obj.id: obj for obj in DoctorAvailability.objects.all()}
        incoming_ids = set()

        result = []

        for item in schedules:
            obj_id = item.get("id")

            payload = {
                "name": item.get("name", ""),
                "days_of_week": item.get("days_of_week", []),
                "start_time": item.get("start_time"),
                "end_time": item.get("end_time"),
                "visit_duration": item.get("visit_duration"),
                "time_gap": item.get("time_gap", 0),
                "is_active": item.get("is_active", True),
            }

            if obj_id and obj_id in existing_objects:
                obj = existing_objects[obj_id]
                for key, value in payload.items():
                    setattr(obj, key, value)
                obj.save()
                incoming_ids.add(obj.id)
                result.append(obj)
            else:
                obj = DoctorAvailability.objects.create(**payload)
                incoming_ids.add(obj.id)
                result.append(obj)

        for obj_id, obj in existing_objects.items():
            if obj_id not in incoming_ids:
                obj.delete()

        return Response(
            DoctorAvailabilitySerializer(result, many=True).data,
            status=status.HTTP_200_OK
        )

class AdminExceptionBulkSaveView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def put(self, request, *args, **kwargs):
        serializer = AvailabilityExceptionBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exceptions = serializer.validated_data["exceptions"]

        existing_objects = {
            obj.id: obj
            for obj in AvailabilityException.objects.all()
        }

        incoming_ids = set()
        result = []

        for item in exceptions:
            obj_id = item.get("id")

            payload = {
                "start_date": item.get("start_date"),
                "end_date": item.get("end_date"),
                "reason": item.get("reason", ""),
            }

            if obj_id and obj_id in existing_objects:
                obj = existing_objects[obj_id]

                for key, value in payload.items():
                    setattr(obj, key, value)

                obj.save()
                incoming_ids.add(obj.id)
                result.append(obj)
            else:
                obj = AvailabilityException.objects.create(**payload)
                incoming_ids.add(obj.id)
                result.append(obj)

        for obj_id, obj in existing_objects.items():
            if obj_id not in incoming_ids:
                obj.delete()

        return Response(
            AvailabilityExceptionSerializer(result, many=True).data,
            status=status.HTTP_200_OK
        )
