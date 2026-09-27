# apps/common/panelchi.py
#
# Thin client for PanelChi's pattern-SMS endpoint. Shared across apps -
# apps/users uses this for OTP codes today; apps/appointments will use
# the same send_pattern_sms() for appointment-accepted/rejected
# notices once those patterns exist on the PanelChi dashboard.
#
# IMPORTANT: this module only ever *sends* a message against a pattern
# slug that already exists in the PanelChi dashboard. Creating a
# pattern (its wording, placeholder syntax, carrier approval) is done
# on their website, not here - there's no "create pattern" endpoint in
# their API to call.

import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


class SmsProviderError(Exception):
    """
    Raised when PanelChi rejects a send or the request itself fails
    (network error, timeout, bad config). The message is safe to
    surface in logs/error responses - it never contains the API token.
    """
    pass


def to_iranian_international(phone_number: str) -> str:
    """
    PanelChi expects an international number. For Iranian numbers,
    '09121234567' -> '+989121234567' (drop the leading 0, add +98).
    Numbers that already look international (start with '+') are left
    as-is.
    """
    phone_number = phone_number.strip()

    if phone_number.startswith("+"):
        return phone_number

    if phone_number.startswith("0"):
        return "+98" + phone_number[1:]

    return phone_number


def send_pattern_sms(pattern: str, recipient: str, variables: dict) -> dict:
    """
    Send a pattern-based SMS via PanelChi.

    `pattern` is the pattern's slug as configured in the PanelChi
    dashboard (e.g. settings.PANELCHI_PATTERN_LOGIN). `recipient` is a
    raw phone number - this function handles the +98 conversion.
    `variables` is a flat dict of placeholder name -> value, matching
    whatever placeholders that pattern's approved template actually
    uses (e.g. {"OTP": "482913", "NAME": "Ali"}).

    Raises SmsProviderError on any failure - callers should not assume
    the message was delivered (or even accepted) unless this returns
    without raising.
    """

    if not settings.PANELCHI_SMS_TOKEN:
        raise SmsProviderError("PANELCHI_SMS_TOKEN is not configured.")

    if not pattern:
        raise SmsProviderError(
            "No PanelChi pattern slug configured for this message - "
            "create the pattern in the PanelChi dashboard first and "
            "set its slug in the corresponding environment variable."
        )

    payload = {
        "pattern": pattern,
        "recipient": to_iranian_international(recipient),
        "variables": variables,
    }

    if settings.PANELCHI_SOURCE_NUMBER:
        payload["sourceNumber"] = settings.PANELCHI_SOURCE_NUMBER

    try:
        response = httpx.post(
            f"{settings.PANELCHI_BASE_URL}/sms/pattern",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.PANELCHI_SMS_TOKEN}",
                "Content-Type": "application/json",
            },
            timeout=settings.PANELCHI_TIMEOUT,
        )

    except httpx.HTTPError as e:
        # Network/timeout error - never include the token (it's only
        # ever in the request headers we built above, not in `e`).
        logger.error("PanelChi request failed: %s", e)
        raise SmsProviderError("Could not reach the SMS provider.") from e

    if response.status_code != 201:
        # Log the provider's response body for debugging, but the
        # token itself was only ever sent as a header, never echoed
        # back by PanelChi in the body, so this is safe to log as-is.
        logger.error(
            "PanelChi rejected SMS send (status %s): %s",
            response.status_code, response.text
        )
        raise SmsProviderError(
            f"SMS provider rejected the request (status {response.status_code})."
        )

    return response.json()
