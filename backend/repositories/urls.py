"""URLs for Repositories app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepositoryViewSet, ZipUploadView, GitHubWebhookAPIView

router = DefaultRouter()
router.register(r'', RepositoryViewSet, basename='repository')

urlpatterns = [
    path('upload-zip/', ZipUploadView.as_view(), name='zip-upload'),
    path('webhooks/github/', GitHubWebhookAPIView.as_view(), name='github-webhook'),
    path('', include(router.urls)),
]
