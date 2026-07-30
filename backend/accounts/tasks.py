"""Celery tasks for Accounts app."""

from celery import shared_task
from django.utils import timezone
from .models import APIKey

@shared_task
def cleanup_expired_api_keys():
    """Mark expired API keys as revoked."""
    now = timezone.now()
    expired_keys = APIKey.objects.filter(expires_at__lt=now, is_revoked=False)
    count = expired_keys.update(is_revoked=True)
    return f"Revoked {count} expired API keys."

@shared_task
def send_sso_invitation_email(user_email, org_name):
    """Stub for sending SSO invitation email."""
    # In production, use a mailer service
    pass
