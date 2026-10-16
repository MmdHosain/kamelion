from django.urls import path

from . import views

urlpatterns = [
    path("", views.ArticleListView.as_view()),
    path("categories/", views.CategoryListView.as_view()),  # must come before <slug>
    path("<str:slug>/", views.ArticleDetailView.as_view()),  # str, not slug (Persian)
]
