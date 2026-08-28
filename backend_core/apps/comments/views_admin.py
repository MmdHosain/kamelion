from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .models import Review
from .serializers import AdminReviewSerializer, ReviewApprovalSerializer


class AdminReviewListView(APIView):
    """
    GET /api/admin/reviews/ - Admin.
    Returns all reviews, including pending/unapproved ones, as a plain
    array (matches the public endpoint's un-paginated shape).
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        reviews = Review.objects.all()
        return Response(AdminReviewSerializer(reviews, many=True).data)


class AdminReviewApprovalView(APIView):
    """
    PATCH /api/admin/reviews/<id>/ - Payload: {"approved": true/false}
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({"detail": "Review not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review.status = Review.APPROVED if serializer.validated_data["approved"] else Review.REJECTED
        review.reviewed_by = request.user
        review.reviewed_at = timezone.now()
        review.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        return Response(AdminReviewSerializer(review).data)

    def delete(self, request, pk):
        """
        DELETE /api/admin/reviews/<id>/ - handled on the
        same view since both share the <id>/ path.
        """
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({"detail": "Review not found"}, status=status.HTTP_404_NOT_FOUND)

        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
