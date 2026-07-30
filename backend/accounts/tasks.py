"""Celery tasks for Accounts app."""

import logging
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import APIKey

logger = logging.getLogger(__name__)

@shared_task
def cleanup_expired_api_keys():
    """Mark expired API keys as revoked."""
    now = timezone.now()
    expired_keys = APIKey.objects.filter(expires_at__lt=now, is_revoked=False)
    count = expired_keys.update(is_revoked=True)
    return f"Revoked {count} expired API keys."

@shared_task
def send_sso_invitation_email(user_email, org_name):
    """Sends SSO invitation email to new team member."""
    subject = f"You've been invited to join {org_name} on SecureCode-AI"
    message = f"Hello,\n\nYou have been invited to join the {org_name} organization on SecureCode-AI.\n\nPlease log in via your SSO provider to accept the invitation.\n\nBest,\nSecureCode-AI Team"
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@securecode-ai.com'),
            recipient_list=[user_email],
            fail_silently=False,
        )
        logger.info(f"Successfully sent SSO invitation email to {user_email}.")
        return True
    except Exception as e:
        logger.error(f"Failed to send SSO invitation to {user_email}: {e}")
        return False
