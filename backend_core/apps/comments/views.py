from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .pagination import CommentPagination
from .serializers import CreateCommentSerializer, CommentSerializer
from .services import create_comment
from .selectors import get_approved_comments, get_comments_for_user


class CommentListView(ListAPIView):
    """
    Public feed of comments - approved only.
    No authentication required to read.
    """
    authentication_classes = []
    permission_classes = []

    serializer_class = CommentSerializer
    pagination_class = CommentPagination

    def get_queryset(self):
        return get_approved_comments()


class CreateCommentView(APIView):
    """
    Submit a new comment. Requires authentication.
    The comment is created as PENDING and is not shown on the public
    feed until an admin approves it.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = create_comment(
            user=request.user,
            text=serializer.validated_data["text"]
        )

        return Response(
            CommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )


class MyCommentsView(ListAPIView):
    """
    The current user's own comments, regardless of moderation status,
    so they can see whether something they posted is still pending
    or was rejected.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer
    pagination_class = CommentPagination

    def get_queryset(self):
        return get_comments_for_user(self.request.user)
