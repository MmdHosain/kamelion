from rest_framework import serializers

from .models import Comment


class CreateCommentSerializer(serializers.Serializer):
    """
    Input for a user submitting a new comment.
    Only the text is accepted - status/user are set server-side.
    """
    text = serializers.CharField(
        max_length=2000,
        allow_blank=False,
        trim_whitespace=True
    )

    def validate_text(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment text cannot be empty.")
        return value.strip()


class CommentSerializer(serializers.ModelSerializer):
    """
    Public/own-comment representation.
    Used both for the public approved-comments feed and for a user's
    own comment list (where status is useful so they can see it's
    still pending).
    """
    full_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "full_name",
            "text",
            "status",
            "created_at",
        ]
        read_only_fields = fields


class AdminCommentSerializer(serializers.ModelSerializer):
    """
    Full representation for admin moderation views - includes the
    author's contact info and review metadata.
    """
    full_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )

    phone_number = serializers.CharField(
        source="user.phone_number",
        read_only=True
    )

    reviewed_by_name = serializers.CharField(
        source="reviewed_by.full_name",
        read_only=True,
        default=None
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "full_name",
            "phone_number",
            "text",
            "status",
            "reviewed_by_name",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
