"""URL Configuration for SecureCode AI.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({"status": "healthy"})


urlpatterns = [
    path("admin/", admin.site.urls),
    
    # OpenAPI Schema & UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    
    # Health check
    path("api/v1/health/", health_check, name="health-check"),
    
    # Domain Apps
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/repositories/", include("repositories.urls")),
    path("api/v1/reviews/", include("reviews.urls")),
    path("api/v1/patches/", include("patches.urls")),
    path("api/v1/verification/", include("verification.urls")),
    path("api/v1/training/", include("training.urls")),
    path("api/v1/evaluation/", include("evaluation.urls")),
    path("api/v1/monitoring/", include("monitoring.urls")),
]
