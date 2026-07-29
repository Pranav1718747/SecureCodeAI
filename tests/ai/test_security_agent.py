"""Unit tests for SecurityAgent and pattern-based heuristic detectors."""

import os
import sys
from uuid import uuid4
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.agents.state import WorkflowState
from ai.security.agent import SecurityAgent
from ai.security.schemas import SeverityLevel, OWASPCategory
from ai.security.detectors import scan_file_heuristics


def test_scan_file_heuristics_sqli():
    """Verify detection of SQL injection pattern."""
    vulnerable_code = """
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
"""
    findings = scan_file_heuristics("app/db.py", vulnerable_code)

    assert len(findings) == 1
    assert findings[0].cwe_id == "CWE-89"
    assert findings[0].severity == SeverityLevel.CRITICAL
    assert findings[0].owasp_category == OWASPCategory.A03_INJECTION
    assert findings[0].line_number == 3


def test_scan_file_heuristics_xss():
    """Verify detection of Cross-Site Scripting pattern."""
    vulnerable_code = """
function RenderProfile({ bio }) {
    return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
"""
    findings = scan_file_heuristics("src/Profile.jsx", vulnerable_code)

    assert len(findings) == 1
    assert findings[0].cwe_id == "CWE-79"
    assert findings[0].severity == SeverityLevel.HIGH


def test_scan_file_heuristics_hardcoded_credentials():
    """Verify detection of hardcoded password secret."""
    vulnerable_code = 'AWS_SECRET_KEY = "AKIA1234567890SECRETKEY"'
    findings = scan_file_heuristics("config/aws.py", vulnerable_code)

    assert len(findings) == 1
    assert findings[0].cwe_id == "CWE-798"
    assert findings[0].severity == SeverityLevel.CRITICAL


def test_scan_file_heuristics_clean_code():
    """Verify zero findings on clean parameterized query code."""
    clean_code = """
def get_user(user_id):
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
"""
    findings = scan_file_heuristics("app/db.py", clean_code)
    assert findings == []


def test_security_agent_analyze_file_content():
    """Verify SecurityAgent filters findings below confidence threshold."""
    agent = SecurityAgent(confidence_threshold=0.5)
    vulnerable_code = 'cursor.execute(f"SELECT * FROM users WHERE id = {uid}")'

    findings = agent.analyze_file_content("app/db.py", vulnerable_code)
    assert len(findings) == 1
    assert findings[0].confidence >= 0.5


def test_security_agent_run_node():
    """Verify SecurityAgent run method executes cleanly in LangGraph context."""
    agent = SecurityAgent()
    state = WorkflowState(repository_id=uuid4())

    update = agent.run(state)
    assert "findings" in update
    assert isinstance(update["findings"], list)
