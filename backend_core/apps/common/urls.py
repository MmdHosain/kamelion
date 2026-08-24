from django.urls import path
from .views import ThemeView, VideoListView

urlpatterns = [
    path("settings/theme", ThemeView.as_view()),
    path("videos/", VideoListView.as_view()),
]
