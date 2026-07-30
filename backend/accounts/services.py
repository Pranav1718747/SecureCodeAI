"""Services for Accounts app encapsulating core business logic."""

import hashlib
import secrets
from django.db import transaction
from django.utils.text import slugify
from common.exceptions import InvalidAPIKeyException
from .models import Organization, User, APIKey
import django.dispatch

user_registered_signal = django.dispatch.Signal()


class UserService:
    @staticmethod
    @transaction.atomic
    def provision_enterprise_user(org_data: dict, user_data: dict) -> User:
        """Provision a new enterprise user and organization if it doesn't exist."""
        slug = slugify(org_data['name'])
        domain = slug + ".enterprise.corp"  # fallback domain logic
        
        org, created = Organization.objects.get_or_create(
            slug=slug,
            defaults={'name': org_data['name'], 'domain': domain}
        )
        
        user = User.objects.create_user(organization=org, **user_data)
        user_registered_signal.send(sender=User, user=user)
        return user


class APIKeyService:
    @staticmethod
    def generate_key(org: Organization, user: User, name: str, scopes: list = None) -> tuple[APIKey, str]:
        """Generate a new API key, store its hash, and return the plaintext once."""
        if scopes is None:
            scopes = ["repo:read", "scan:write"]
            
        raw_key = secrets.token_urlsafe(32)
        key_prefix = raw_key[:8]
        hashed_key = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
        
        api_key = APIKey.objects.create(
            organization=org,
            created_by=user,
            name=name,
            key_prefix=key_prefix,
            hashed_key=hashed_key,
            scopes=scopes
        )
        return api_key, raw_key

    @staticmethod
    def validate_key(raw_key: str) -> APIKey:
        """Validate a plaintext API key and return its object if valid."""
        hashed_key = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
        try:
            key_obj = APIKey.objects.get(hashed_key=hashed_key, is_revoked=False)
            return key_obj
        except APIKey.DoesNotExist:
            raise InvalidAPIKeyException()
