# apps/users/services.py

import random
import secrets
from django.conf import settings
from django.utils import timezone
from django.db import transaction

from .models import User, OTPRequest, PhoneVerification
from apps.common.panelchi import send_pattern_sms, panelchi_enabled, SmsProviderError


OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5
SIGNUP_TOKEN_EXPIRY_MINUTES = 10


def generate_otp():
    """
    Generate a random numeric OTP code.
    Example: '483920'
    """
    return ''.join(str(random.randint(0, 9)) for _ in range(OTP_LENGTH))


def request_otp(phone_number: str):
    """
    Create and store a new OTP for a phone number, then deliver it.

    Any previous unused OTPs are invalidated first. Delivery depends
    on settings.SMS_PROVIDER:
    - 'console' (default, local dev): the code is only printed to the
      server log.
    - 'panelchi': sent via PanelChi's pattern-SMS API. If that send
      fails, the just-created OTP row is deleted and SmsProviderError
      is raised - callers must not tell the user "OTP sent" when it
      wasn't.
    """

    phone_number = phone_number.strip()

    # invalidate previous unused OTPs
    OTPRequest.objects.filter(
        phone_number=phone_number,
        is_used=False
    ).update(is_used=True)

    code = generate_otp()

    otp = OTPRequest.objects.create(
        phone_number=phone_number,
        code=code
    )

    if panelchi_enabled():
        # This pattern's approved template is:
        #   کد تایید شما %otp_code%
        #   ورود به پنل دکتر معشوری متخصص پستان
        # -> a single placeholder, `otp_code`. No name/greeting
        # placeholder exists in this pattern, so nothing else is sent.
        # If a future pattern (e.g. appointment-accepted) uses
        # different placeholder names, match those exactly here too -
        # PanelChi has nothing to substitute a variable it doesn't
        # recognize.
        variables = {"otp_code": code}

        try:
            send_pattern_sms(
                pattern=settings.PANELCHI_PATTERN_LOGIN,
                recipient=phone_number,
                variables=variables,
            )
        except SmsProviderError:
            # Don't leave a code on file that was never actually
            # delivered - and don't tell the caller it was sent.
            otp.delete()
            raise

    else:
        # Local/dev fallback - no SMS provider configured.
        print(f"OTP for {phone_number}: {code}")

    return otp


@transaction.atomic
def verify_otp(phone_number: str, code: str):
    """
    Step 1 of login: confirm the OTP code is correct for this phone
    number. As soon as it checks out, we're sure the caller really
    owns that phone number, so the code is consumed right here -
    this step is self-contained and doesn't wait on anything else.

    Returns a tuple of (kind, value):
    - ("user", user)          - phone number already has an account;
                                 the caller is logged in.
    - ("signup_token", token) - first time we've seen this phone
                                 number; the caller must now call
                                 complete_registration() with this
                                 token plus full_name and national_id
                                 (and optionally sex / date_of_birth)
                                 to finish creating the account.
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

    # The code is correct - consume it now. Phone ownership is
    # confirmed either way, regardless of what happens next.
    otp.is_used = True
    otp.save(update_fields=["is_used"])

    user = User.objects.filter(phone_number=phone_number).first()
    if user:
        return "user", user

    # First time seeing this phone number - hand back a short-lived
    # token proving the phone was just verified, so the registration
    # step doesn't need the OTP again.
    signup = PhoneVerification.objects.create(
        phone_number=phone_number,
        token=secrets.token_urlsafe(32),
    )

    return "signup_token", signup.token


@transaction.atomic
def complete_registration(token: str, full_name: str, national_id: str,
                          sex=None, date_of_birth=None):
    """
    Step 2 of login, first-time patients only: creates the account
    for the phone number that was verified in verify_otp(), using
    the signup token as proof instead of the OTP code.

    full_name and national_id are required; sex and date_of_birth are
    optional and stored as NULL when not given.
    """

    full_name = (full_name or "").strip()
    national_id = (national_id or "").strip()

    if not full_name or not national_id:
        raise ValueError("full_name and national_id are required.")

    try:
        signup = PhoneVerification.objects.get(token=token, is_used=False)
    except PhoneVerification.DoesNotExist:
        raise ValueError("Invalid or already-used signup session.")

    if signup.is_expired():
        raise ValueError("Signup session expired - please verify your phone number again.")

    signup.is_used = True
    signup.save(update_fields=["is_used"])

    user = User.objects.create(
        phone_number=signup.phone_number,
        full_name=full_name,
        national_id=national_id,
        sex=(sex or None),
        date_of_birth=date_of_birth,
    )

    return user