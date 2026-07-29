"""Planner Agent State and Schema Definitions.

Defines FileType enums, ScanBatch, and ScanPlan Pydantic models.
"""

from enum import Enum
from pydantic import BaseModel, Field


class FileType(str, Enum):
    """Supported source file classifications."""

    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    SQL = "sql"
    CONFIG = "config"
    HTML = "html"
    OTHER = "other"


class ScanBatch(BaseModel):
    """A token-budget-bounded batch of files for security scanning."""

    batch_id: int
    files: list[str] = Field(default_factory=list)
    priority: int = 3
    estimated_tokens: int = 0


class ScanPlan(BaseModel):
    """Full execution plan produced by PlannerAgent for a repository scan."""

    batches: list[ScanBatch] = Field(default_factory=list)
    total_files: int = 0
    estimated_tokens: int = 0
    high_risk_files_count: int = 0
