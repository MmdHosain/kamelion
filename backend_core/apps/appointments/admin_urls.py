from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_admin import (
    AdminSlotViewSet,
    AdminExceptionViewSet,
    AdminAppointmentsView,
)

router = DefaultRouter()
router.register("slots", AdminSlotViewSet)
router.register("exceptions", AdminExceptionViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("appointments/", AdminAppointmentsView.as_view()),
]
