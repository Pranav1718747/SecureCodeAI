"""Unit tests for CriticAgent and rule-based validation logic."""

import os
import sys
from uuid import uuid4
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.agents.state import WorkflowState
from ai.security.schemas import Finding, SeverityLevel, OWASPCategory
from ai.critic.agent import CriticAgent
from ai.critic.schemas import RejectionCode
from ai.critic.validators import validate_finding_rules


def test_validate_finding_rules_valid():
    """Verify valid finding passes validation."""
    finding = Finding(
        file_path="backend/views.py",
        line_number=42,
        vulnerability_type="SQL Injection",
        owasp_category=OWASPCategory.A03_INJECTION,
        cwe_id="CWE-89",
        severity=SeverityLevel.CRITICAL,
        confidence=0.9,
        description="Raw SQL query execution.",
        explanation="Constructing SQL queries using string formatting enables SQL Injection attacks.",
        code_snippet='cursor.execute(f"SELECT * FROM users WHERE id = {uid}")',
    )
    result = validate_finding_rules(finding)

    assert result.is_valid is True
    assert result.rejection_code == RejectionCode.NONE
    assert result.quality_score.overall_score >= 0.80


def test_validate_finding_rules_missing_line_number():
    """Verify finding with invalid line number is rejected."""
    finding = Finding(
        file_path="backend/views.py",
        line_number=0,  # Invalid
        vulnerability_type="SQL Injection",
        owasp_category=OWASPCategory.A03_INJECTION,
        cwe_id="CWE-89",
        severity=SeverityLevel.CRITICAL,
        confidence=0.9,
        description="Raw SQL query execution.",
        explanation="Constructing SQL queries using string formatting enables SQL Injection attacks.",
        code_snippet='cursor.execute(f"SELECT * FROM users WHERE id = {uid}")',
    )
    result = validate_finding_rules(finding)

    assert result.is_valid is False
    assert result.rejection_code == RejectionCode.MISSING_LINE_NUMBER


def test_validate_finding_rules_short_explanation():
    """Verify finding with explanation under 5 words is rejected."""
    finding = Finding(
        file_path="backend/views.py",
        line_number=10,
        vulnerability_type="SQL Injection",
        owasp_category=OWASPCategory.A03_INJECTION,
        cwe_id="CWE-89",
        severity=SeverityLevel.CRITICAL,
        confidence=0.9,
        description="SQL injection.",
        explanation="SQL injection bad.",  # 3 words
        code_snippet="cursor.execute(query)",
    )
    result = validate_finding_rules(finding)

    assert result.is_valid is False
    assert result.rejection_code == RejectionCode.EXPLANATION_TOO_SHORT


def test_validate_finding_rules_invalid_cwe_id():
    """Verify finding with non-CWE prefixed ID is rejected."""
    finding = Finding(
        file_path="backend/views.py",
        line_number=10,
        vulnerability_type="SQL Injection",
        owasp_category=OWASPCategory.A03_INJECTION,
        cwe_id="INVALID-89",
        severity=SeverityLevel.CRITICAL,
        confidence=0.9,
        description="SQL injection.",
        explanation="Constructing SQL queries using string formatting enables SQL Injection attacks.",
        code_snippet="cursor.execute(query)",
    )
    result = validate_finding_rules(finding)

    assert result.is_valid is False
    assert result.rejection_code == RejectionCode.INVALID_CWE_ID


def test_critic_agent_filter_findings():
    """Verify CriticAgent separates valid findings from rejected findings."""
    valid_finding = Finding(
        file_path="backend/views.py",
        line_number=15,
        vulnerability_type="SQL Injection",
        owasp_category=OWASPCategory.A03_INJECTION,
        cwe_id="CWE-89",
        severity=SeverityLevel.CRITICAL,
        confidence=0.95,
        description="Raw SQL query execution.",
        explanation="Constructing SQL queries using string formatting enables SQL Injection attacks.",
        code_snippet="cursor.execute(query)",
    )
    invalid_finding = Finding(
        file_path="backend/views.py",
        line_number=0,  # Invalid
        vulnerability_type="SQL Injection",
        owasp_category=OWASPCategory.A03_INJECTION,
        cwe_id="CWE-89",
        severity=SeverityLevel.CRITICAL,
        confidence=0.95,
        description="Raw SQL query execution.",
        explanation="Constructing SQL queries using string formatting enables SQL Injection attacks.",
        code_snippet="cursor.execute(query)",
    )

    agent = CriticAgent()
    valid_list, results = agent.filter_findings([valid_finding, invalid_finding])

    assert len(valid_list) == 1
    assert valid_list[0].id == valid_finding.id
    assert len(results) == 2


def test_critic_agent_run_node():
    """Verify CriticAgent run method updates state with filtered findings."""
    agent = CriticAgent()
    valid_finding = Finding(
        file_path="backend/views.py",
        line_number=20,
        vulnerability_type="SQL Injection",
        owasp_category=OWASPCategory.A03_INJECTION,
        cwe_id="CWE-89",
        severity=SeverityLevel.CRITICAL,
        confidence=0.95,
        description="Raw SQL query execution.",
        explanation="Constructing SQL queries using string formatting enables SQL Injection attacks.",
        code_snippet="cursor.execute(query)",
    )
    state = WorkflowState(repository_id=uuid4(), findings=[valid_finding])

    update = agent.run(state)
    assert "findings" in update
    assert len(update["findings"]) == 1
