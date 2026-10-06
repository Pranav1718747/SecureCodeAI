"""URL Configuration for SecureCode AI."""

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
        except Exception:
            pass

    return JsonResponse({
        "env_loaded": ENV_PATH.exists(),
        "token_found": bool(token),
        "token_prefix": token_prefix,
        "github_authenticated": github_authenticated,
        "username": username,
        "repo_access": github_authenticated
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    
    # OpenAPI Schema & UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    
    # Direct Health check & Debug
    path("api/v1/health/", health_check, name="health-check"),
    path("api/debug/github", debug_github, name="debug-github"),
    
    # App 1: Accounts (Auth, Multi-Tenancy, API Keys)
    path("api/v1/accounts/", include("accounts.urls")),
    
    # App 2: Core Engine (Repositories, Scans, Vulnerabilities, Patches, Verification, Monitoring, Training, Eval)
    path("api/v1/", include("core.urls")),
]
