import os

from django.conf import settings
from django.core.checks import Warning, register


@register()
def check_ai_service_settings(app_configs, **kwargs):
    problems = []
    if not settings.AI_SERVICE_BASE_URL:
        problems.append(Warning(
            "AI_SERVICE_BASE_URL is not set: every chat message will get the fallback reply.",
            id="chat_gateway.W001",
        ))

    if not settings.AI_SERVICE_API_KEY:
        problems.append(Warning(
            "AI_SERVICE_API_KEY is not set: every request to the AI Service would be rejected "
            "with 401, so every chat message will get the fallback reply.",
            id="chat_gateway.W002",
        ))

    ca_bundle = settings.AI_SERVICE_CA_BUNDLE
    if ca_bundle and not os.path.isfile(ca_bundle):
        problems.append(Warning(
            f"AI_SERVICE_CA_BUNDLE points to {ca_bundle!r}, which does not exist: TLS to the "
            "AI Service will fail and every chat message will get the fallback reply.",
            id="chat_gateway.W005",
        ))

    if not settings.CLINIC_PHONE_NUMBER:
        problems.append(Warning(
            "CLINIC_PHONE_NUMBER is not set: the fallback message must contain the clinic's "
            "phone number (API.md §7.3).",
            id="chat_gateway.W003",
        ))
    if settings.AI_SERVICE_BASE_URL and not settings.DEBUG and not settings.AI_SERVICE_BASE_URL.startswith("https://"):
        problems.append(Warning(
            "AI_SERVICE_BASE_URL should use HTTPS (API.md §2).",
            id="chat_gateway.W004",
        ))
    return problems