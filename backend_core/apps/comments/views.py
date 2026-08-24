from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import ReviewSerializer
from .models import Review


class ReviewListCreateView(APIView):
    """
    GET  /api/reviews/ - Public. Returns a plain array (not DRF-paginated)
                          of only approved reviews, per the documented
                          shape: [{id, name, email, text, rating,
                          created_at, approved}].
    POST /api/reviews/ - Public (no auth). Payload: {name, email, text, rating}.
                          New reviews start pending and need admin sign-off
                          before they appear in the public GET.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        reviews = Review.objects.filter(status=Review.APPROVED)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user if request.user and request.user.is_authenticated else None
        review = serializer.save(user=user, status=Review.PENDING)

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
