"""Signal handlers for Accounts app."""

from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Organization, APIKey


@receiver(pre_delete, sender=Organization)
def revoke_api_keys_on_org_delete(sender, instance, **kwargs):
    """Revoke all API keys when an organization is deleted."""
    APIKey.objects.filter(organization=instance).update(is_revoked=True)
