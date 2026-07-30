"""Signals for Reviews app."""

from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Scan

@receiver(post_save, sender=Scan)
def notify_scan_update(sender, instance, created, **kwargs):
    """Sends a websocket notification when scan status changes."""
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f'scan_{instance.id}',
            {
                'type': 'scan_update',
                'data': {
                    'id': str(instance.id),
                    'status': instance.status,
                    'total_vulnerabilities': instance.total_vulnerabilities
                }
            }
        )
