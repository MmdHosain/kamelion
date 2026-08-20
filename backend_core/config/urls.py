from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/admin/", include("apps.appointments.admin_urls")),
    path("api/admin/comments/", include("apps.comments.admin_urls")),
    path("api/", include("apps.users.urls")),
    path("api/appointments/", include("apps.appointments.urls")),
    path("api/comments/", include("apps.comments.urls")),
]
