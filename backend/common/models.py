"""Abstract base models providing enterprise-standard fields for all SecureCode AI domain entities.

WHY THIS EXISTS:
    Every database table in SecureCode AI requires a consistent primary key strategy (UUIDv4),
    automatic timestamp tracking (created_at, updated_at), and deterministic default ordering.
    Rather than repeating these 5 fields in every model definition, TimeStampedModel centralizes
    them into a single abstract base class that all domain models inherit from.

HOW IT WORKS:
    TimeStampedModel is declared with `abstract = True` in its Meta class, meaning Django will
    never create a database table for it directly. Instead, every child model (Organization, User,
    Repository, Scan, Vulnerability, Patch, etc.) inherits these fields and they are added to the
    child's own database table.

FIELD SPECIFICATIONS:
    id          - UUIDv4 primary key. Eliminates sequential ID enumeration attacks. Allows
                  distributed Celery workers to pre-generate IDs before DB transaction commit.
    created_at  - Immutable timestamp set once at record creation (auto_now_add=True).
    updated_at  - Mutable timestamp refreshed on every .save() call (auto_now=True).

ORDERING:
    Default ordering is newest-first (`-created_at`) to optimize dashboard listing queries
    where users expect to see the most recent entities at the top.
"""

import uuid

from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base model providing UUIDv4 PK and automatic timestamp tracking.

    All SecureCode AI domain entities inherit from this class to guarantee:
    1. Globally unique, non-sequential primary keys (UUIDv4).
    2. Immutable creation timestamp for audit trail compliance.
    3. Auto-updating modification timestamp for cache invalidation.
    4. Consistent newest-first default ordering across all list endpoints.

    Attributes:
        id: 128-bit UUIDv4 primary key, generated at object instantiation time.
        created_at: Server-side timestamp recorded once at initial INSERT.
        updated_at: Server-side timestamp refreshed on every UPDATE.
    """

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
