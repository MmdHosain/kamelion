from django.db.models import Q
from rest_framework import status
from rest_framework.generics import (
    DestroyAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import Article, Category
from .pagination import ArticlePagination
from .serializers import ArticleAdminWriteSerializer, CategorySerializer


class ArticleAdminListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ArticleAdminWriteSerializer
    pagination_class = ArticlePagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Article.objects.select_related("author", "category").order_by(
            "-created_at"
        )
        status_param = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        if status_param in (Article.DRAFT, Article.PUBLISHED):
            qs = qs.filter(status=status_param)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(excerpt__icontains=search))
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)  # author = current user


class ArticleAdminDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ArticleAdminWriteSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    queryset = Article.objects.all()


class ArticleToggleStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        article = Article.objects.filter(pk=pk).first()
        if article is None:
            return Response({"detail": "یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
        article.status = (
            Article.DRAFT if article.status == Article.PUBLISHED else Article.PUBLISHED
        )
        article.save()  # save() fills published_at the first time
        return Response(
            {
                "id": article.id,
                "status": article.status,
                "published_at": article.published_at,
            }
        )


class ImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("image") or request.FILES.get("file")
        if file is None:
            return Response(
                {"detail": "فایلی ارسال نشده است."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            url = services.save_inline_image(file)
        except services.ImageValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "url": request.build_absolute_uri(url),
                "message": "تصویر با موفقیت آپلود و بهینه‌سازی شد.",
            },
            status=status.HTTP_201_CREATED,
        )


class CategoryAdminListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    pagination_class = None


class CategoryAdminDeleteView(DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Category.objects.all()
