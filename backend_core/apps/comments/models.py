from django.conf import settings
from django.db import models


class Review(models.Model):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
    ]

    name = models.CharField(max_length=100, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    text = models.TextField(max_length=2000)

    # Required (1-5) - reviews always have a rating; there's no more
    # ratingless "comment" variant, so this is no longer nullable.
    rating = models.PositiveSmallIntegerField()

    # Optional link if the reviewer happened to be logged in - not
    # required, since public submission doesn't need an account.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_reviews",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"Review #{self.pk} by {self.name} ({self.rating}\u2605, {self.status})"

    @property
    def approved(self):
        return self.status == self.APPROVED
