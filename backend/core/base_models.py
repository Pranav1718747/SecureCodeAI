"""Base abstract models for SecureCode AI."""

import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base model providing UUIDv4 PK and automatic timestamp tracking."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Globally unique UUIDv4 identifier for this entity.",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Immutable timestamp of initial record creation.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of most recent record modification.",
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]
        get_latest_by = "created_at"
