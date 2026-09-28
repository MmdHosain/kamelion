import calendar
from collections import defaultdict
from datetime import date as date_cls, datetime, timedelta

from django.db import transaction
from django.utils import timezone

from apps.users.models import User

from .notifications import send_appointment_decision_sms
from .models import (
    DoctorAvailability,
    AvailabilityException,
    Appointment
)


def get_weekday_code(date):
    """
    Convert Python weekday number to our model code.

    Python weekday():
    Monday = 0
    Sunday = 6
    """

    mapping = {
        0: "MON",
        1: "TUE",
        2: "WED",
        3: "THU",
        4: "FRI",
        5: "SAT",
        6: "SUN",
    }

    return mapping[date.weekday()]


def _build_slots(date, availability):
    """
    Build the list of slot start-times for one date from one
    DoctorAvailability rule.
    """

    start = datetime.combine(date, availability.start_time)
    end = datetime.combine(date, availability.end_time)

    visit = timedelta(minutes=availability.visit_duration)
    gap = timedelta(minutes=availability.time_gap)

    slots = []
    current = start

    while current + visit <= end:
        slots.append(current.time())
        current += visit + gap

    return slots


def generate_slots(date):
    """
    Generate all potential time slots for a given date
    based on DoctorAvailability rules.
    """

    weekday = get_weekday_code(date)

    availability = None

    for item in DoctorAvailability.objects.filter(is_active=True):
        if weekday in (item.days_of_week or []):
            availability = item
            break

    if not availability:
        return []

    return _build_slots(date, availability)


def get_available_slots(date):
    """
    Return only free slots for a given date.

    Steps:
    1. Check if clinic is closed (AvailabilityException)
    2. Generate potential slots
    3. Remove already booked slots
    """

    # Step 1: check if the date is blocked
    is_blocked = AvailabilityException.objects.filter(
        start_date__lte=date,
        end_date__gte=date
    ).exists()

    if is_blocked:
        return []

    # Step 2: generate slots
    slots = generate_slots(date)

    if not slots:
        return []

    # Step 3: remove booked slots
    # A slot is unavailable once it's pending review too, not only once
    # it's approved - otherwise two people could be pending on the same
    # slot at once.
    booked = Appointment.objects.filter(
        appointment_date=date,
        status__in=[Appointment.PENDING, Appointment.SCHEDULED]
    ).values_list("appointment_time", flat=True)

    available = [slot for slot in slots if slot not in booked]

    return available


def get_unavailable_dates(year, month):
    """
    Return every date in the given month on which the doctor cannot
    be booked at all. A date is unavailable when:

    - it falls inside an AvailabilityException (clinic closed), or
    - no active DoctorAvailability covers that weekday (not in office), or
    - every generated slot is already taken (pending or scheduled).

    Uses a fixed number of queries (3) for the whole month instead of
    calling get_available_slots() once per day.
    """

    days_in_month = calendar.monthrange(year, month)[1]
    first_day = date_cls(year, month, 1)
    last_day = date_cls(year, month, days_in_month)

    # weekday code -> availability rule (same "first match wins" rule
    # generate_slots() uses)
    availability_by_weekday = {}
    for item in DoctorAvailability.objects.filter(is_active=True):
        for code in item.days_of_week or []:
            availability_by_weekday.setdefault(code, item)

    exceptions = list(
        AvailabilityException.objects.filter(
            start_date__lte=last_day,
            end_date__gte=first_day,
        ).values_list("start_date", "end_date")
    )

    booked_by_date = defaultdict(set)
    booked_rows = Appointment.objects.filter(
        appointment_date__range=(first_day, last_day),
        status__in=[Appointment.PENDING, Appointment.SCHEDULED],
    ).values_list("appointment_date", "appointment_time")
    for appt_date, appt_time in booked_rows:
        booked_by_date[appt_date].add(appt_time)

    unavailable = []

    for day in range(1, days_in_month + 1):
        current = date_cls(year, month, day)

        if any(start <= current <= end for start, end in exceptions):
            unavailable.append(current)
            continue

        availability = availability_by_weekday.get(get_weekday_code(current))
        if availability is None:
            unavailable.append(current)
            continue

        slots = _build_slots(current, availability)
        booked = booked_by_date.get(current, set())

        if not any(slot not in booked for slot in slots):
            unavailable.append(current)

    return unavailable


WEEK_ORDER = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]


def get_weekly_schedule_spans():
    """
    Collapse the doctor's weekly schedule into runs of consecutive
    days that share the same working hours, e.g.

        SUN-WED  09:00-17:00
        THU-FRI  09:00-13:00
        SAT      not available

    The week runs Sunday -> Saturday (same order as DAY_CHOICES).
    Days with no active schedule are grouped into "not available"
    spans the same way. This describes the recurring weekly pattern
    only; one-off closures (AvailabilityException) are not included.
    """

    hours_by_day = {}
    for item in DoctorAvailability.objects.filter(is_active=True):
        for code in item.days_of_week or []:
            hours_by_day.setdefault(code, (item.start_time, item.end_time))

    spans = []

    for code in WEEK_ORDER:
        hours = hours_by_day.get(code)  # None -> not available

        if spans and spans[-1]["_hours"] == hours:
            spans[-1]["days"].append(code)
            spans[-1]["end_day"] = code
            continue

        spans.append({
            "_hours": hours,
            "days": [code],
            "start_day": code,
            "end_day": code,
        })

    result = []
    for span in spans:
        hours = span.pop("_hours")
        span["available"] = hours is not None
        span["start_time"] = hours[0] if hours else None
        span["end_time"] = hours[1] if hours else None
        result.append(span)

    return result


@transaction.atomic
def book_appointment(user, date, time, reason="", status=Appointment.PENDING):
    """
    Book an appointment safely.

    Uses a database transaction to prevent race conditions
    where two users try to book the same slot simultaneously.

    Defaults to PENDING - a patient's own booking needs admin
    approval before it's confirmed. Callers that should skip that
    review (e.g. an admin creating a walk-in booking) pass
    status=Appointment.SCHEDULED explicitly.
    """

    # Check if slot exists
    available_slots = get_available_slots(date)

    if time not in available_slots:
        raise ValueError("Selected time slot is not available.")

    appointment = Appointment.objects.create(
        user=user,
        appointment_date=date,
        appointment_time=time,
        reason=reason,
        status=status
    )

    return appointment


def cancel_appointment(appointment):
    """
    Cancel an existing appointment. A patient can cancel it while
    it's still pending review or already approved/scheduled.
    """

    if appointment.status not in (Appointment.PENDING, Appointment.SCHEDULED):
        raise ValueError("Appointment cannot be cancelled.")

    appointment.status = Appointment.CANCELLED_BY_USER
    appointment.save(update_fields=["status"])

    return appointment


def approve_appointment(appointment):
    """
    Admin approves a pending appointment, confirming its slot.
    """

    if appointment.status != Appointment.PENDING:
        raise ValueError("Only pending appointments can be approved.")

    appointment.status = Appointment.SCHEDULED
    appointment.save(update_fields=["status"])

    send_appointment_decision_sms(appointment, approved=True)

    return appointment


def disapprove_appointment(appointment):
    """
    Admin disapproves a pending appointment, freeing up its slot.
    """

    if appointment.status != Appointment.PENDING:
        raise ValueError("Only pending appointments can be disapproved.")

    appointment.status = Appointment.CANCELLED_BY_ADMIN
    appointment.save(update_fields=["status"])

    send_appointment_decision_sms(appointment, approved=False)

    return appointment


@transaction.atomic
def admin_book_appointment(full_name: str, phone_number: str, date, time, reason=""):
    """
    Book an appointment on behalf of a patient, identified by name +
    phone number (as entered by an admin) rather than a logged-in user.

    Deliberately reuses book_appointment()'s slot check rather than
    inserting directly, so an admin-created appointment is held to
    the exact same availability rules as a patient-created one - it
    cannot double-book a slot or ignore the doctor's schedule.

    If no user exists yet for this phone number, one is created
    (same get-or-create pattern used by the OTP login flow), so a
    walk-in/phone booking naturally becomes that patient's account
    the first time they log in with the same number.

    Booked directly as SCHEDULED (not PENDING) since the admin is
    the one creating it - there's no separate approval step needed.
    """
    phone_number = phone_number.strip()
    full_name = full_name.strip()

    user, created = User.objects.get_or_create(
        phone_number=phone_number
    )

    if created or not user.full_name:
        user.full_name = full_name
        user.save(update_fields=["full_name"])

    return book_appointment(user, date, time, reason, status=Appointment.SCHEDULED)