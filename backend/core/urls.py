"""URL routing for SecureCode AI Core Engine."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    HealthCheckView,
    RepositoryViewSet,
    ZipUploadView,
    GitHubWebhookAPIView,
    ScanViewSet,
    VulnerabilityViewSet,
    PatchViewSet,
    VerificationRunViewSet,
    AuditLogViewSet,
    FeedbackEventViewSet,
    FineTuningJobViewSet,
    ModelEvaluationViewSet,
)

# 1. Repositories Router
repo_router = DefaultRouter()
repo_router.register(r'', RepositoryViewSet, basename='repository')

repositories_urlpatterns = [
    path('upload-zip/', ZipUploadView.as_view(), name='zip-upload'),
    path('webhooks/github/', GitHubWebhookAPIView.as_view(), name='github-webhook'),
    path('', include(repo_router.urls)),
]

# 2. Reviews / Scans Router
reviews_router = DefaultRouter()
reviews_router.register(r'scans', ScanViewSet, basename='scan')
reviews_router.register(r'vulnerabilities', VulnerabilityViewSet, basename='vulnerability')

reviews_urlpatterns = [
    path('', include(reviews_router.urls)),
]

# 3. Patches Router
patches_router = DefaultRouter()
patches_router.register(r'', PatchViewSet, basename='patch')

patches_urlpatterns = [
    path('', include(patches_router.urls)),
]

# 4. Verification Router
verification_router = DefaultRouter()
verification_router.register(r'runs', VerificationRunViewSet, basename='verificationrun')

verification_urlpatterns = [
    path('', include(verification_router.urls)),
]

# 5. Monitoring Router
monitoring_router = DefaultRouter()
monitoring_router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

monitoring_urlpatterns = [
    path('', include(monitoring_router.urls)),
]

# 6. Training Router
training_router = DefaultRouter()
training_router.register(r'feedback', FeedbackEventViewSet, basename='feedback')
training_router.register(r'jobs', FineTuningJobViewSet, basename='finetuningjob')

training_urlpatterns = [
    path('', include(training_router.urls)),
]

# 7. Evaluation Router
evaluation_router = DefaultRouter()
evaluation_router.register(r'', ModelEvaluationViewSet, basename='evaluation')

evaluation_urlpatterns = [
    path('', include(evaluation_router.urls)),
]

# Combined urlpatterns
urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('repositories/', include((repositories_urlpatterns, 'repositories'))),
    path('reviews/', include((reviews_urlpatterns, 'reviews'))),
    path('patches/', include((patches_urlpatterns, 'patches'))),
    path('verification/', include((verification_urlpatterns, 'verification'))),
    path('monitoring/', include((monitoring_urlpatterns, 'monitoring'))),
    path('training/', include((training_urlpatterns, 'training'))),
    path('evaluation/', include((evaluation_urlpatterns, 'evaluation'))),
]
