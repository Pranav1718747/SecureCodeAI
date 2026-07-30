"""URLs for API Gateway."""

from django.urls import path
from .views import HealthCheckView

urlpatterns = [
    # Already mounted at /api/v1/health/ in config/urls.py directly,
    # but we can provide this for consistency if needed.
]
