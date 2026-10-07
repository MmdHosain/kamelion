from django.db.models import F, Q
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Article, Category
from .pagination import ArticlePagination
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    CategorySerializer,
)


class PublicMixin:
    permission_classes = [AllowAny]
    authentication_classes = []  # an expired token must not 401 a public page

    def get_queryset(self):
        return Article.objects.filter(status=Article.PUBLISHED).select_related(
            "author", "category"
        )


class ArticleListView(PublicMixin, ListAPIView):
    serializer_class = ArticleListSerializer
    pagination_class = ArticlePagination

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        if category:
            qs = qs.filter(category__slug=category)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(excerpt__icontains=search))
        return qs


class ArticleDetailView(PublicMixin, RetrieveAPIView):
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Article.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
        instance.views_count += 1  # the response reflects this request's view too
        return Response(self.get_serializer(instance).data)


class CategoryListView(ListAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    pagination_class = None
