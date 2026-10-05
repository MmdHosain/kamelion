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

    key = settings.AI_SERVICE_SIGNING_KEY
    if not key:
        problems.append(Warning(
            "AI_SERVICE_SIGNING_KEY is not set: requests to the AI Service cannot be signed, "
            "so every chat message will get the fallback reply.",
            id="chat_gateway.W002",
        ))
    elif "BEGIN PRIVATE KEY" not in key or "END PRIVATE KEY" not in key:
        problems.append(Warning(
            "AI_SERVICE_SIGNING_KEY does not look like a PEM private key. In .env it must be on "
            "one line with \\n between the lines.",
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