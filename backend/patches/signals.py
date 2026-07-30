"""Signals for Patches app."""

import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Patch

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Patch)
def log_patch_updates(sender, instance, created, **kwargs):
    """Log when patches are generated or verified."""
    if created:
        logger.info(f"New patch generated for vulnerability {instance.vulnerability.id}.")
    else:
        logger.info(f"Patch {instance.id} status updated to {instance.status}.")
