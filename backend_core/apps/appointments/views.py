from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .pagination import AppointmentPagination

from .serializers import (
    SlotQuerySerializer,
    BookAppointmentSerializer,
    AppointmentSerializer
)

from .services import (
    get_available_slots,
    get_unavailable_dates,
    get_weekly_schedule_spans,
    book_appointment,
    cancel_appointment
)

from .models import Appointment
from rest_framework.generics import ListAPIView
    
    
class AvailableSlotsView(APIView):
    """
    GET /api/appointments/slots/?date=YYYY-MM-DD
        -> {"date": ..., "available_slots": [...]}

    GET /api/appointments/slots/?month=YYYY-MM
        -> {"month": ..., "unavailable_dates": [...]}
        Every date in that month the doctor can't be booked: clinic
        closed, not in office that weekday, or fully booked.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):

        serializer = SlotQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data.get("date")

        if date:
            slots = get_available_slots(date)

            return Response({
                "date": date,
                "available_slots": slots
            })

        month = serializer.validated_data["month"]
        year_str, month_str = month.split("-")

        return Response({
            "month": month,
            "unavailable_dates": get_unavailable_dates(
                int(year_str), int(month_str)
            ),
        })


class WeeklyScheduleView(APIView):
    """
    GET /api/appointments/schedule/

    The doctor's weekly hours as runs of consecutive days, for the
    main page, e.g. SUN-WED 09:00-17:00, THU-FRI 09:00-13:00,
    SAT not available.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"spans": get_weekly_schedule_spans()})


class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = BookAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data["date"]
        time = serializer.validated_data["time"]
        reason = serializer.validated_data.get("reason", "")

        try:
            appointment = book_appointment(
                request.user,
                date,
                time,
                reason
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED
        )


class MyAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        appointments = Appointment.objects.filter(
            user=request.user
        ).order_by("-appointment_date")

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)


class CancelAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            appointment = Appointment.objects.get(
                id=pk,
                user=request.user
            )
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            cancel_appointment(appointment)
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"status": "cancelled"})
