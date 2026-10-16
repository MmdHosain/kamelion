from django.apps import AppConfig


class ChatGatewayConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.chat_gateway'

    def ready(self):
        from . import checks  # noqa: F401  (registers the system checks)
