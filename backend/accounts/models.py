"""Database ORM models for Identity, Auth, and Multi-Tenancy."""

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from core.base_models import TimeStampedModel


class Organization(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    domain = models.CharField(max_length=255, unique=True)
    subscription_plan = models.CharField(
        max_length=50, 
        default="ENTERPRISE_TRIAL",
        choices=[
            ("ENTERPRISE_TRIAL", "Enterprise Trial"),
            ("ENTERPRISE_PRO", "Enterprise Pro"),
            ("ENTERPRISE_CUSTOM", "Enterprise Custom"),
        ]
    )
    max_repositories = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)
    sso_enabled = models.BooleanField(default=False)
    sso_saml_config = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ORG_ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, TimeStampedModel):
    username = None  # Remove username field
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, max_length=254)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(
        max_length=50, 
        default="DEVELOPER",
        choices=[
            ("ORG_ADMIN", "Organization Admin"),
            ("SECURITY_LEAD", "Security Lead"),
            ("DEVELOPER", "Developer"),
            ("AUDITOR", "Auditor"),
        ]
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self):
        return self.email


class APIKey(TimeStampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    key_prefix = models.CharField(max_length=16)
    hashed_key = models.CharField(max_length=128, unique=True)
    scopes = models.JSONField(default=list)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_revoked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.key_prefix}...)"
