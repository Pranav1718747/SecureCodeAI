import os
import django
import asyncio
from asgiref.sync import async_to_sync

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from channels.layers import get_channel_layer
from reviews.models import Scan, Vulnerability

scan = Scan.objects.filter(repository__name='cricket-simulator').last()
if scan:
    print(f"Sending test websocket message for scan {scan.id}")
    
    # Try sending progress
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"scan_{scan.id}",
        {
            "type": "scan_update",
            "data": {
                "type": "progress",
                "file": "test_streaming_file.py",
                "progress": {
                    "processed_files": 42,
                    "total_files": 100
                }
            }
        }
    )
    print("Message sent.")
