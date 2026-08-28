from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_admin import (
    AdminSlotViewSet,
    AdminExceptionViewSet,
    AdminAppointmentsView,
    AdminAppointmentDetailView,
    AdminCreateAppointmentView,
    AdminSlotBulkSaveView,
    AdminExceptionBulkSaveView,
)

router = DefaultRouter()
router.register("slots", AdminSlotViewSet)
router.register("exceptions", AdminExceptionViewSet)

urlpatterns = [
    path("slots/bulk/", AdminSlotBulkSaveView.as_view(), name="admin-slots-bulk"),
    path("exceptions/bulk/", AdminExceptionBulkSaveView.as_view(), name="admin-exceptions-bulk"),
    path("", include(router.urls)),
    path("appointments/", AdminAppointmentsView.as_view()),
    path("appointments/create/", AdminCreateAppointmentView.as_view()),
    path("appointments/<int:pk>/", AdminAppointmentDetailView.as_view()),
]