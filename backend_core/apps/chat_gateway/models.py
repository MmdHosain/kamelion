from django.conf import settings
from django.db import models


class ChatSession(models.Model):
    """
    One row per chat widget session.
    session_id comes from the frontend so a visitor's whole conversation can be grouped, whether
    they're logged in or anonymous.
    """
    session_id = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chat_sessions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.session_id


class ChatMessage(models.Model):
    USER = "user"
    BOT = "bot"
    SENDER_CHOICES = [(USER, "User"), (BOT, "Bot")]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    text = models.TextField()
    is_emergency = models.BooleanField(default=False)
    emergency_code = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["is_emergency"])]

    def __str__(self):
        return f"[{self.sender}] {self.text[:40]}"
