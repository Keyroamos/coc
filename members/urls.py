from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, ChildViewSet, DashboardStatsView, GlobalSearchView

router = DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'children', ChildViewSet)

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('global-search/', GlobalSearchView.as_view(), name='global-search'),
    path('', include(router.urls)),
]
