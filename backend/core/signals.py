"""Signals for Core Engine."""

from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from core.models import Scan, Repository


@receiver(post_save, sender=Scan)
def notify_scan_update(sender, instance, created, **kwargs):
    """Sends a WebSocket notification when scan status changes."""
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


@receiver(post_save, sender=Repository)
def notify_repository_update(sender, instance, created, **kwargs):
    """Sends a WebSocket notification when repository index status changes."""
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f'repo_updates_{instance.organization.id}',
            {
                'type': 'repo_update',
                'data': {
                    'id': str(instance.id),
                    'status': instance.ast_index_status,
                    'name': instance.name
                }
            }
        )
