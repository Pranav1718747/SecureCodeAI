"""URL Configuration for SecureCode AI.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "healthy"})

def debug_github(request):
    from config.env import settings, ENV_PATH
    import requests
    
    token = settings.github_token
    token_prefix = f"{token[:4]}{'*' * (len(token)-4)}" if token and len(token) > 4 else None
    
    github_authenticated = False
    username = None
    if token:
        try:
            response = requests.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                timeout=5
            )
            if response.status_code == 200:
                github_authenticated = True
                username = response.json().get('login')
        except:
            pass

    return JsonResponse({
        "env_loaded": ENV_PATH.exists(),
        "token_found": bool(token),
        "token_prefix": token_prefix,
        "github_authenticated": github_authenticated,
        "username": username,
        "repo_access": github_authenticated  # simplifying for this debug endpoint
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    
    # OpenAPI Schema & UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    
    # Health check
    path("api/v1/health/", health_check, name="health-check"),
    path("api/debug/github", debug_github, name="debug-github"),
    
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
