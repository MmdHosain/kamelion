from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_admin import (
    AdminSlotViewSet,
    AdminExceptionViewSet,
    AdminAppointmentsView,
    AdminSlotBulkSaveView,  # 1. Import this
)

router = DefaultRouter()
router.register("slots", AdminSlotViewSet)
router.register("exceptions", AdminExceptionViewSet)

urlpatterns = [
    # 2. Add this BEFORE router.urls to ensure it takes precedence
    path("slots/bulk/", AdminSlotBulkSaveView.as_view(), name="admin-slots-bulk"),
    path("", include(router.urls)),
    path("appointments/", AdminAppointmentsView.as_view()),
]
