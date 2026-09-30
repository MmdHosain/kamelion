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
            "AI_SERVICE_API_KEY is not set: the AI Service will answer 401 (API.md §2.1).",
            id="chat_gateway.W002",
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
