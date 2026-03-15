# apps/users/services.py

import random
from django.utils import timezone
from django.db import transaction

from .models import User, OTPRequest


OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5


def generate_otp():
    """
    Generate a random numeric OTP code.
    Example: '483920'
    """
    return ''.join(str(random.randint(0, 9)) for _ in range(OTP_LENGTH))


def request_otp(phone_number: str):
    """
    Create and store a new OTP for a phone number.
    Any previous unused OTPs should be invalidated.
    """

    phone_number = phone_number.strip()

    # invalidate previous unused OTPs
    OTPRequest.objects.filter(
        phone_number=phone_number,
        is_used=False
    ).update(is_used=True)

    code = generate_otp()
    
    print(f"OTP for {phone_number}: {code}")

    otp = OTPRequest.objects.create(
        phone_number=phone_number,
        code=code
    )

    # TODO: integrate SMS provider here
    # send_sms(phone_number, code)

    return otp


@transaction.atomic
def verify_otp(phone_number: str, code: str):
    """
    Validate OTP and return authenticated user.

    Steps:
    1. Find OTP
    2. Check expiration
    3. Mark as used
    4. Create user if first login
    """

    phone_number = phone_number.strip()

    try:
        otp = OTPRequest.objects.filter(
            phone_number=phone_number,
            code=code,
            is_used=False
        ).latest("created_at")

    except OTPRequest.DoesNotExist:
        raise ValueError("Invalid OTP")

    if otp.is_expired():
        raise ValueError("OTP expired")

    # mark OTP used
    otp.is_used = True
    otp.save(update_fields=["is_used"])

    # get or create user
    user, _ = User.objects.get_or_create(
        phone_number=phone_number
    )

    return user
