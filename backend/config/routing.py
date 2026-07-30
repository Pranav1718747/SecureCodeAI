"""WebSocket routing."""

from django.urls import path
from api.consumers import ScanStatusConsumer

websocket_urlpatterns = [
    path('ws/scans/<str:scan_id>/', ScanStatusConsumer.as_asgi()),
]
