"""The reminder clock is explicitly Tehran time, independent of Django's timezone."""

from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

TEHRAN = ZoneInfo("Asia/Tehran")


def reminder_time(appointment_date):
    return datetime.combine(appointment_date - timedelta(days=1), time(10), tzinfo=TEHRAN)


def dispatch_time(now):
    local_now = now.astimezone(TEHRAN)
    if local_now.hour == 10 and local_now.minute == 0:
        return local_now.replace(second=0, microsecond=0)
    return None
