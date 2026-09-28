from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Case, When, Value, IntegerField
from .models import DoctorAvailability, AvailabilityException, Appointment
from .serializers import (
    DoctorAvailabilitySerializer,
    DoctorAvailabilityBulkSerializer,
    AvailabilityExceptionSerializer,
    AvailabilityExceptionBulkSerializer,
    AppointmentSerializer,
    AdminBookAppointmentSerializer,
)
from .services import admin_book_appointment, approve_appointment, disapprove_appointment
from .pagination import AppointmentPagination
from .notifications import send_appointment_decision_sms




class AdminSlotViewSet(viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all().order_by("id")
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAdminUser]

class AdminExceptionViewSet(viewsets.ModelViewSet):
    queryset = AvailabilityException.objects.all()
    serializer_class = AvailabilityExceptionSerializer
    permission_classes = [IsAdminUser]

class AdminAppointmentsView(ListCreateAPIView):
    """
    GET  /api/admin/appointments/  -> paginated list 
    POST /api/admin/appointments/  -> create a manual/walk-in booking
    POST is delegated to the same admin_book_appointment() service used
    by AdminCreateAppointmentView below, so both URLs stay in sync and
    go through the same slot-availability checks.
    """
    pagination_class = AppointmentPagination
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminBookAppointmentSerializer
        return AppointmentSerializer

    def get_queryset(self):
        queryset = (
            Appointment.objects
            .select_related("user")
            .all()
            .order_by("-id")
        )

        # e.g. GET /api/admin/appointments/?status=pending to pull up
        # just the reservations awaiting approval.
        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)

        search = self.request.query_params.get("search")

        if search:
            search = search.strip()
            terms = search.split()

            for term in terms:
                queryset = queryset.filter(
                    Q(user__full_name__icontains=term) |
                    Q(user__phone_number__icontains=term)
                )

            queryset = queryset.annotate(
                rank=Case(
                    When(user__full_name__iexact=search, then=Value(3)),
                    When(user__phone_number__iexact=search, then=Value(3)),
                    When(user__full_name__icontains=search, then=Value(2)),
                    When(user__phone_number__icontains=search, then=Value(2)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ).order_by("-rank", "-id")

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            appointment = admin_book_appointment(
                full_name=serializer.validated_data["full_name"],
                phone_number=serializer.validated_data["phone_number"],
                date=serializer.validated_data["date"],
                time=serializer.validated_data["time"],
                reason=serializer.validated_data.get("reason", ""),
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED
        )


class AdminAppointmentDetailView(RetrieveUpdateDestroyAPIView):
    """
    PUT    /api/admin/appointments/<id>/  -> adminApi.updateReservation()
    DELETE /api/admin/appointments/<id>/  -> adminApi.deleteReservation()

    adminApi.updateReservation(id, data) sends whatever subset of fields
    changed (e.g. just {"status": "visited"} or a reschedule), so PUT is
    treated as a partial update rather than requiring the full payload.
    """
    queryset = Appointment.objects.select_related("user").all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAdminUser]

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        # The admin panel approves/rejects by PUTting a new status here
        # (not necessarily via the approve/ and disapprove/ endpoints),
        # so notify the patient whenever a PENDING appointment moves to
        # scheduled (approved) or cancelled_admin (rejected).
        old_status = serializer.instance.status
        appointment = serializer.save()

        if old_status == Appointment.PENDING:
            if appointment.status == Appointment.SCHEDULED:
                send_appointment_decision_sms(appointment, approved=True)
            elif appointment.status == Appointment.CANCELLED_BY_ADMIN:
                send_appointment_decision_sms(appointment, approved=False)


class AdminCreateAppointmentView(APIView):
    """
    Lets an admin book an appointment on behalf of a patient by
    entering their full name and phone number directly (e.g. for a
    walk-in or phone booking), rather than the patient booking it
    themselves while logged in.

    Goes through the same slot-availability check as the patient
    booking flow (via services.admin_book_appointment ->
    book_appointment), so this cannot be used to double-book a slot
    or schedule outside the doctor's configured availability.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminBookAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            appointment = admin_book_appointment(
                full_name=serializer.validated_data["full_name"],
                phone_number=serializer.validated_data["phone_number"],
                date=serializer.validated_data["date"],
                time=serializer.validated_data["time"],
                reason=serializer.validated_data.get("reason", ""),
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED
        )

class AdminApproveAppointmentView(APIView):
    """
    POST /api/admin/appointments/<id>/approve/
    Confirms a pending appointment, moving it to "scheduled".
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.select_related("user").get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            approve_appointment(appointment)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AppointmentSerializer(appointment).data)


class AdminDisapproveAppointmentView(APIView):
    """
    POST /api/admin/appointments/<id>/disapprove/
    Rejects a pending appointment, moving it to "cancelled_admin"
    and freeing up its slot.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.select_related("user").get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            disapprove_appointment(appointment)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AppointmentSerializer(appointment).data)


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