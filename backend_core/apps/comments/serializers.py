from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """
    Endpoints #24/#25: GET/POST /api/reviews/ (public).
    Matches frontend-api-evaluation.md's documented shape exactly:
    [{id, name, email, text, rating, created_at, approved}]
    """
    class Meta:
        model = Review
        fields = ["id", "name", "email", "text", "rating", "created_at", "approved"]
        read_only_fields = ["id", "created_at", "approved"]
        extra_kwargs = {
            "rating": {"required": True, "allow_null": False},
        }

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name cannot be empty.")
        return value

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Review text cannot be empty.")
        return value


class AdminReviewSerializer(serializers.ModelSerializer):
    """
    Endpoint #26: GET /api/admin/reviews/ - includes pending/unapproved.
    """
    class Meta:
        model = Review
        fields = ["id", "name", "email", "text", "rating", "created_at", "updated_at", "approved"]
        read_only_fields = fields


class ReviewApprovalSerializer(serializers.Serializer):
    """
    Endpoint #27: PATCH /api/admin/reviews/<id>/ - Payload: {"approved": true/false}
    """
    approved = serializers.BooleanField()
