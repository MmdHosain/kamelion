from django.urls import path
from .views import AdminThemeView, AdminVideoCreateView, AdminVideoDeleteView
from .stats_views import AdminStatsView

urlpatterns = [
    path("settings/theme", AdminThemeView.as_view()),
    path("videos/", AdminVideoCreateView.as_view()),
    path("videos/<int:pk>/", AdminVideoDeleteView.as_view()),
    path("stats", AdminStatsView.as_view()),
]
