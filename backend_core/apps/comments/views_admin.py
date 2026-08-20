from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import Comment
from .pagination import CommentPagination
from .serializers import AdminCommentSerializer
from .selectors import get_all_comments
from .services import approve_comment, reject_comment


class AdminCommentListView(ListAPIView):
    """
    List every comment for moderation, newest first.
    Optional ?status=pending|approved|rejected to filter the queue.
    """
    serializer_class = AdminCommentSerializer
    pagination_class = CommentPagination
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        status_filter = self.request.query_params.get("status")
        return get_all_comments(status=status_filter)


class AdminCommentApproveView(APIView):
    """
    Approve a pending comment so it appears on the public feed.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response(
                {"detail": "Comment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            comment = approve_comment(comment, request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AdminCommentSerializer(comment).data)


class AdminCommentRejectView(APIView):
    """
    Reject a comment so it will never show up on the public feed.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response(
                {"detail": "Comment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            comment = reject_comment(comment, request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AdminCommentSerializer(comment).data)


class AdminCommentDeleteView(APIView):
    """
    Permanently delete a comment (e.g. spam) regardless of its status.
    """
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response(
                {"detail": "Comment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
