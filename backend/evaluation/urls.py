"""URLs for Evaluation app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModelEvaluationViewSet

router = DefaultRouter()
router.register(r'', ModelEvaluationViewSet, basename='evaluation')

urlpatterns = [
    path('', include(router.urls)),
]
