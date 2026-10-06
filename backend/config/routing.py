"""WebSocket routing."""

from django.urls import path
from core.consumers import ScanStatusConsumer

websocket_urlpatterns = [
    path('ws/scans/<str:scan_id>/', ScanStatusConsumer.as_asgi()),
]
