from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from .models import SiteSetting, Video
from .serializers import ThemeSerializer, VideoSerializer


class ThemeView(APIView):
    """
    GET /api/settings/theme - Public.
    Returns {"theme": "pink"} per frontend-api-evaluation.md.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"theme": SiteSetting.get_theme()})


class AdminThemeView(APIView):
    """
    PUT /api/admin/settings/theme - Admin.
    Payload: {"theme": "pink"}.
    """
    permission_classes = [IsAdminUser]

    def put(self, request):
        serializer = ThemeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        theme = SiteSetting.set_theme(serializer.validated_data["theme"])
        return Response({"theme": theme}, status=status.HTTP_200_OK)


class VideoListView(ListAPIView):
    """
    GET /api/videos/ - Public.
    Returns [{id, title, src, type}].
    """
    authentication_classes = []
    permission_classes = []
    serializer_class = VideoSerializer
    queryset = Video.objects.all()


class AdminVideoCreateView(APIView):
    """
    POST /api/admin/videos/ - Admin.
    Payload: {"title": "...", "src": "...", "type": "video"|"iframe"}.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = VideoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        video = serializer.save()
        return Response(VideoSerializer(video).data, status=status.HTTP_201_CREATED)


class AdminVideoDeleteView(APIView):
    """
    DELETE /api/admin/videos/<id>/ - Admin.
    """
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            video = Video.objects.get(pk=pk)
        except Video.DoesNotExist:
            return Response({"detail": "Video not found"}, status=status.HTTP_404_NOT_FOUND)
        video.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
