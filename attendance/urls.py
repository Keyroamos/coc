from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, EventViewSet, VisitorViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'visitors', VisitorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
