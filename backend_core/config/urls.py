from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/admin/", include("apps.appointments.admin_urls")),
    path("api/admin/reviews/", include("apps.comments.review_admin_urls")),
    path("api/admin/", include("apps.common.admin_urls")),
    path("api/admin/", include("apps.users.admin_urls")),
    path("api/", include("apps.users.urls")),
    path("api/appointments/", include("apps.appointments.urls")),
    path("api/reviews/", include("apps.comments.review_urls")),
    path("api/chat/", include("apps.chat_gateway.urls")),
    path("api/", include("apps.common.urls")),
]
