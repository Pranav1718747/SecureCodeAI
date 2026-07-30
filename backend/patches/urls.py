"""URLs for Patches app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatchViewSet

router = DefaultRouter()
router.register(r'', PatchViewSet, basename='patch')

urlpatterns = [
    path('', include(router.urls)),
]
