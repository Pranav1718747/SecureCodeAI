"""URLs for Verification app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VerificationRunViewSet

router = DefaultRouter()
router.register(r'runs', VerificationRunViewSet, basename='verificationrun')

urlpatterns = [
    path('', include(router.urls)),
]
