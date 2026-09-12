from datetime import datetime, timedelta

from django.db import transaction
from django.utils import timezone

from apps.users.models import User

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

    return appointment


def disapprove_appointment(appointment):
    """
    Admin disapproves a pending appointment, freeing up its slot.
    """

    if appointment.status != Appointment.PENDING:
        raise ValueError("Only pending appointments can be disapproved.")

    appointment.status = Appointment.CANCELLED_BY_ADMIN
    appointment.save(update_fields=["status"])

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