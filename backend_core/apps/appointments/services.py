from datetime import datetime, timedelta

from django.db import transaction
from django.utils import timezone

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
        0: DoctorAvailability.MONDAY,
        1: DoctorAvailability.TUESDAY,
        2: DoctorAvailability.WEDNESDAY,
        3: DoctorAvailability.THURSDAY,
        4: DoctorAvailability.FRIDAY,
        5: DoctorAvailability.SATURDAY,
        6: DoctorAvailability.SUNDAY,
    }

    return mapping[date.weekday()]


def generate_slots(date):
    """
    Generate all potential time slots for a given date
    based on DoctorAvailability rules.
    """

    weekday = get_weekday_code(date)

    availability = DoctorAvailability.objects.filter(
        day_of_week=weekday,
        is_active=True
    ).first()

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
    booked = Appointment.objects.filter(
        appointment_date=date,
        status=Appointment.SCHEDULED
    ).values_list("appointment_time", flat=True)

    available = [slot for slot in slots if slot not in booked]

    return available


@transaction.atomic
def book_appointment(user, date, time, reason=""):
    """
    Book an appointment safely.

    Uses a database transaction to prevent race conditions
    where two users try to book the same slot simultaneously.
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
        status=Appointment.SCHEDULED
    )

    return appointment


def cancel_appointment(appointment):
    """
    Cancel an existing appointment.
    """

    if appointment.status != Appointment.SCHEDULED:
        raise ValueError("Appointment cannot be cancelled.")

    appointment.status = Appointment.CANCELLED_BY_USER
    appointment.save(update_fields=["status"])

    return appointment
