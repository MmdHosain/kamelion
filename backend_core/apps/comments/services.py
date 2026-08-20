# apps/comments/services.py

from django.db import transaction
from django.utils import timezone

from .models import Comment


def create_comment(user, text: str) -> Comment:
    """
    Create a new comment for an authenticated user.

    Every new comment starts out PENDING - it is not shown publicly
    until an admin approves it.
    """
    return Comment.objects.create(
        user=user,
        text=text,
        status=Comment.PENDING
    )


@transaction.atomic
def approve_comment(comment: Comment, admin_user) -> Comment:
    """
    Approve a pending comment so it becomes publicly visible.
    """
    if comment.status == Comment.APPROVED:
        raise ValueError("Comment is already approved.")

    comment.status = Comment.APPROVED
    comment.reviewed_by = admin_user
    comment.reviewed_at = timezone.now()
    comment.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

    return comment


@transaction.atomic
def reject_comment(comment: Comment, admin_user) -> Comment:
    """
    Reject a comment so it will never be shown publicly.
    """
    if comment.status == Comment.REJECTED:
        raise ValueError("Comment is already rejected.")

    comment.status = Comment.REJECTED
    comment.reviewed_by = admin_user
    comment.reviewed_at = timezone.now()
    comment.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

    return comment
