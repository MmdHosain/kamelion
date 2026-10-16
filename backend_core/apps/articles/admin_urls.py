from django.urls import path

from . import views_admin as v

urlpatterns = [
    path("upload-image/", v.ImageUploadView.as_view()),
    path("categories/", v.CategoryAdminListCreateView.as_view()),
    path("categories/<int:pk>/", v.CategoryAdminDeleteView.as_view()),
    path("", v.ArticleAdminListCreateView.as_view()),
    path("<int:pk>/", v.ArticleAdminDetailView.as_view()),
    path("<int:pk>/toggle-status/", v.ArticleToggleStatusView.as_view()),
]
