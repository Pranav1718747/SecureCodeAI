"""Security Agent Schemas and Vulnerability Finding Models."""

from enum import Enum
from typing import Optional
from uuid import uuid4, UUID
from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    """Vulnerability severity levels."""

    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class OWASPCategory(str, Enum):
    """OWASP Top 10 2021 categories."""

    A01_BROKEN_ACCESS_CONTROL = "A01:2021-Broken Access Control"
    A02_CRYPTOGRAPHIC_FAILURES = "A02:2021-Cryptographic Failures"
    A03_INJECTION = "A03:2021-Injection"
    A04_INSECURE_DESIGN = "A04:2021-Insecure Design"
    A05_SECURITY_MISCONFIGURATION = "A05:2021-Security Misconfiguration"
    A06_VULNERABLE_COMPONENTS = "A06:2021-Vulnerable and Outdated Components"
    A07_AUTHENTICATION_FAILURES = "A07:2021-Identification and Authentication Failures"
    A08_INTEGRITY_FAILURES = "A08:2021-Software and Data Integrity Failures"
    A09_LOGGING_FAILURES = "A09:2021-Security Logging and Monitoring Failures"
    A10_SSRF = "A10:2021-Server-Side Request Forgery (SSRF)"
    OTHER = "Other Security Weakness"


class Finding(BaseModel):
    """Pydantic model representing a single detected vulnerability finding."""

    id: UUID = Field(default_factory=uuid4)
    file_path: str
    line_number: int
    vulnerability_type: str
    owasp_category: OWASPCategory
    cwe_id: str
    severity: SeverityLevel
    confidence: float = Field(ge=0.0, le=1.0)
    description: str
    explanation: str
    code_snippet: str


class SecurityAnalysisResult(BaseModel):
    """Collection wrapper for findings produced by SecurityAgent."""

    findings: list[Finding] = Field(default_factory=list)
