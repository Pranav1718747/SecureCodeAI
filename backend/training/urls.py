"""URLs for Training app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackEventViewSet, FineTuningJobViewSet

router = DefaultRouter()
router.register(r'feedback', FeedbackEventViewSet, basename='feedback')
router.register(r'jobs', FineTuningJobViewSet, basename='finetuningjob')

urlpatterns = [
    path('', include(router.urls)),
]
