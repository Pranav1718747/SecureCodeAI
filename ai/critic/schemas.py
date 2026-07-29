"""Critic Agent Schemas and Quality Validation Models."""

from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field


class RejectionCode(str, Enum):
    """Enumerated rejection reason codes for invalid findings."""

    NONE = "NONE"
    MISSING_LINE_NUMBER = "MISSING_LINE_NUMBER"
    EXPLANATION_TOO_SHORT = "EXPLANATION_TOO_SHORT"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    INVALID_CWE_ID = "INVALID_CWE_ID"
    MISSING_CODE_SNIPPET = "MISSING_CODE_SNIPPET"


class QualityScore(BaseModel):
    """Granular quality scores for a security finding."""

    accuracy_score: float = Field(ge=0.0, le=1.0)
    completeness_score: float = Field(ge=0.0, le=1.0)
    explanation_quality: float = Field(ge=0.0, le=1.0)
    overall_score: float = Field(ge=0.0, le=1.0)


class ValidationResult(BaseModel):
    """Pydantic model representing the Critic Agent's evaluation of a finding."""

    finding_id: UUID
    is_valid: bool
    rejection_code: RejectionCode = RejectionCode.NONE
    rejection_reason: str = ""
    quality_score: QualityScore
