from .models import Comment


def get_approved_comments():
    """
    Comments visible to the public - approved only, newest first
    (default model ordering already handles the newest-first part).
    """
    return Comment.objects.filter(
        status=Comment.APPROVED
    ).select_related("user")


def get_comments_for_user(user):
    """
    A user's own comments, regardless of status, so they can see
    what's still pending or was rejected.
    """
    return Comment.objects.filter(user=user)


def get_all_comments(status=None):
    """
    Admin queryset - all comments, optionally filtered by status.
    """
    queryset = Comment.objects.select_related("user", "reviewed_by")

    if status:
        queryset = queryset.filter(status=status)

    return queryset
