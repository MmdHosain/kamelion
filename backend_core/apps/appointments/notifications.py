# apps/appointments/notifications.py
#
# SMS notices to a patient when an admin decides on their pending
# appointment. Uses the shared PanelChi client in apps/common.
#
# Patterns (created on the PanelChi dashboard, slugs in .env):
#   approved -> PANELCHI_PATTERN_APPOINTMENT_APPROVED
#       "%full_name% گرامی، نوبت شما ... در تاریخ %time% %date% ثبت شد ..."
#   rejected -> PANELCHI_PATTERN_APPOINTMENT_REJECTED
#       "%full_name% گرامی، درخواست نوبت شما ... در تاریخ %time% %date% پذیرفته نشد ..."

import logging

import jdatetime
from django.conf import settings

from apps.common.panelchi import send_pattern_sms, panelchi_enabled, SmsProviderError

logger = logging.getLogger(__name__)

# Placeholder names as written in the approved PanelChi templates.
# Must match the template text exactly (e.g. %date%) - PanelChi has
# nothing to substitute a variable name it doesn't recognise.
NAME_VARIABLE = "full_name"
TIME_VARIABLE = "time"
DATE_VARIABLE = "date"


def _jalali_date(date) -> str:
    """2026-09-29 -> '1405/07/07' (patients read Jalali dates)."""
    return jdatetime.date.fromgregorian(date=date).strftime("%Y/%m/%d")


def send_appointment_decision_sms(appointment, approved: bool) -> bool:
    """
    Tell the patient their appointment request was approved or not.

    Never raises: the admin's decision has already been saved, and a
    failed text message must not undo it or turn the admin's click
    into an error. Returns True if the SMS was accepted by the
    provider, False otherwise (failures are logged).
    """
    user = appointment.user
    date_text = _jalali_date(appointment.appointment_date)
    time_text = appointment.appointment_time.strftime("%H:%M")
    name = user.full_name or "مراجع کننده"

    if not panelchi_enabled():
        # Local/dev fallback, same idea as the console OTP.
        logger.info(
            "[console SMS] appointment %s for %s on %s %s: %s",
            appointment.id, user.phone_number, date_text, time_text,
            "approved" if approved else "rejected",
        )
        return False

    pattern = (
        settings.PANELCHI_PATTERN_APPOINTMENT_APPROVED
        if approved
        else settings.PANELCHI_PATTERN_APPOINTMENT_REJECTED
    )

    try:
        send_pattern_sms(
            pattern=pattern,
            recipient=user.phone_number,
            variables={
                NAME_VARIABLE: name,
                TIME_VARIABLE: time_text,
                DATE_VARIABLE: date_text,
            },
        )
    except SmsProviderError as e:
        logger.error(
            "Could not send appointment %s SMS for appointment %s: %s",
            "approval" if approved else "rejection", appointment.id, e,
        )
        return False

    return True
