from datetime import date

import jdatetime
from django.db.models import Avg
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from apps.appointments.models import Appointment
from apps.comments.models import Review
from apps.chat_gateway.models import ChatSession

# Jalali (Persian solar calendar) month names, index 1-12, matching the
# example payload in frontend-api-evaluation.md (فروردین, اردیبهشت, ...).
JALALI_MONTH_NAMES = [
    None, "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

STATUS_LABEL_COMPLETED = "ویزیت‌های انجام شده"
STATUS_LABEL_PENDING = "در انتظار ویزیت"


def _percent_growth(current, previous):
    if previous == 0:
        return "N/A" if current == 0 else "+100%"
    pct = round(((current - previous) / previous) * 100)
    sign = "+" if pct >= 0 else ""
    return f"{sign}{pct}% vs last month"


def _month_bounds(months_ago: int, today: date):
    """First day of the Gregorian month `months_ago` months before `today`."""
    year = today.year
    month = today.month - months_ago
    while month <= 0:
        month += 12
        year -= 1
    return year, month


class AdminStatsView(APIView):
    """
    GET /api/admin/stats - Admin only.

    Month labels in `monthly_trends` use Jalali (Persian solar calendar)
    month names via the `jdatetime` package, matching the doc's example
    payload exactly. Appointment counts are still grouped by Gregorian
    calendar month internally (i.e. "this Gregorian month" is labeled
    with whichever Jalali month name the 1st of that Gregorian month
    falls in) - close enough for a trend chart, though the Jalali month
    boundary doesn't perfectly align with the Gregorian one since the
    two calendars don't share month-start days.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()

        # --- total visits & attendance ---
        visited_count = Appointment.objects.filter(status=Appointment.VISITED).count()
        cancelled_count = Appointment.objects.filter(
            status__in=[Appointment.CANCELLED_BY_USER, Appointment.CANCELLED_BY_ADMIN]
        ).count()
        online_bookings = Appointment.objects.exclude(
            status__in=[Appointment.CANCELLED_BY_USER, Appointment.CANCELLED_BY_ADMIN]
        ).count()

        attendance_denominator = visited_count + cancelled_count
        attendance_rate = (
            f"{round((visited_count / attendance_denominator) * 100)}%"
            if attendance_denominator > 0 else "N/A"
        )

        # --- month-over-month growth on total appointments created ---
        this_month_start = today.replace(day=1)
        y, m = _month_bounds(1, today)
        last_month_start = date(y, m, 1)

        this_month_count = Appointment.objects.filter(
            created_at__date__gte=this_month_start
        ).count()
        last_month_count = Appointment.objects.filter(
            created_at__date__gte=last_month_start, created_at__date__lt=this_month_start
        ).count()
        visits_growth = _percent_growth(this_month_count, last_month_count)

        # --- chat/triage ---
        triage_chats = ChatSession.objects.count()
        # Emergency codes will be issued by the chat gateway's urgent action, which is not
        # built yet. Until then there is nothing to count.
        emergency_codes = 0

        # --- reviews/satisfaction ---
        approved_reviews = Review.objects.filter(status=Review.APPROVED)
        reviews_count = approved_reviews.count()
        avg_rating = approved_reviews.aggregate(avg=Avg("rating"))["avg"] or 0
        satisfaction_rating = f"{avg_rating:.1f} / 5.0"

        # --- monthly trends: appointment volume for the last 6 months,
        #     labeled with Jalali month names ---
        monthly_trends = []
        for i in range(5, -1, -1):
            y, m = _month_bounds(i, today)
            start = date(y, m, 1)
            if i == 0:
                # current month: up to today (inclusive)
                count = Appointment.objects.filter(
                    appointment_date__gte=start, appointment_date__lte=today
                ).count()
            else:
                end_y, end_m = _month_bounds(i - 1, today)
                end = date(end_y, end_m, 1)
                count = Appointment.objects.filter(
                    appointment_date__gte=start, appointment_date__lt=end
                ).count()

            jalali_month = jdatetime.date.fromgregorian(date=start).month
            monthly_trends.append({"month": JALALI_MONTH_NAMES[jalali_month], "value": count})

        # --- status breakdown (percentages), Persian labels per the doc ---
        pending_count = Appointment.objects.filter(status=Appointment.SCHEDULED).count()
        breakdown_total = visited_count + pending_count
        if breakdown_total > 0:
            status_breakdown = [
                {"name": STATUS_LABEL_COMPLETED, "value": round((visited_count / breakdown_total) * 100)},
                {"name": STATUS_LABEL_PENDING, "value": round((pending_count / breakdown_total) * 100)},
            ]
        else:
            status_breakdown = [
                {"name": STATUS_LABEL_COMPLETED, "value": 0},
                {"name": STATUS_LABEL_PENDING, "value": 0},
            ]

        return Response({
            "total_visits": visited_count,
            "visits_growth": visits_growth,
            "online_bookings": online_bookings,
            "attendance_rate": attendance_rate,
            "triage_chats": triage_chats,
            "emergency_codes": emergency_codes,
            "satisfaction_rating": satisfaction_rating,
            "reviews_count": reviews_count,
            "monthly_trends": monthly_trends,
            "status_breakdown": status_breakdown,
        })
