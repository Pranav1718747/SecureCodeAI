"""Tests for AI Agents."""
import pytest
from ai.critic.schemas import ValidationResult
from ai.security.schemas import Finding, VulnerabilitySeverity
from ai.critic.agent import CriticAgent

@pytest.fixture
def mock_finding():
    return Finding(
        title="Hardcoded Password",
        description="A hardcoded password was found.",
        severity=VulnerabilitySeverity.HIGH,
        file_path="src/config.py",
        line_number=10,
        snippet="password = 'secret'",
        confidence=0.9
    )

def test_critic_agent_validation(mock_finding):
    """Test the critic agent validation logic."""
    agent = CriticAgent()
    # Ensure it works gracefully and uses fallback rules or LLM correctly
    result = agent.validate_finding(mock_finding)
    assert isinstance(result, ValidationResult)
