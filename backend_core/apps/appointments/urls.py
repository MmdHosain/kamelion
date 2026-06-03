from django.urls import path
from .views import (
    AvailableSlotsView,
    BookAppointmentView,
    MyAppointmentsView,
    CancelAppointmentView,
)

urlpatterns = [
    path("slots/", AvailableSlotsView.as_view()),
    path("book/", BookAppointmentView.as_view()),
    path("my/", MyAppointmentsView.as_view()),
    path("<int:pk>/cancel/", CancelAppointmentView.as_view()),
]
