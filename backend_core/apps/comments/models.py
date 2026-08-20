from django.conf import settings
from django.db import models


class Comment(models.Model):
    # Moderation status values
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
    ]

    # Author of the comment - must be an authenticated user
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    # Comment body
    text = models.TextField(max_length=2000)

    # Moderation state - every comment starts out pending
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )

    # Admin who approved/rejected this comment (if any)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_comments"
    )

    # When the comment was reviewed (approved or rejected)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"Comment #{self.pk} by {self.user_id} ({self.status})"
