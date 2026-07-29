import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import io
import json
from uuid import uuid4
from unittest.mock import MagicMock, patch

import pytest
from pydantic import BaseModel

from ai.agents.base import BaseAgent, AgentInvocationError
from ai.agents.state import WorkflowState, AgentError


class SampleResponseSchema(BaseModel):
    status: str
    message: str


class ConcreteAgent(BaseAgent):
    """Concrete implementation of BaseAgent for testing."""

    def run(self, state: WorkflowState) -> dict:
        return {"status": "completed"}


def test_workflow_state_initialization():
    """Verify WorkflowState initializes with valid defaults."""
    repo_id = uuid4()
    state = WorkflowState(repository_id=repo_id)

    assert state.repository_id == repo_id
    assert state.branch == "main"
    assert state.file_tree == []
    assert state.findings == []
    assert state.errors == []


def test_agent_error_serialization():
    """Verify AgentError model creates clean dictionaries."""
    err = AgentError(
        agent_name="PlannerAgent",
        error_code="PARSE_ERROR",
        message="Failed to parse batch",
    )
    assert err.agent_name == "PlannerAgent"
    assert err.error_code == "PARSE_ERROR"


def test_base_agent_invocation_success():
    """Test successful LLM call and Pydantic parsing."""
    agent = ConcreteAgent()
    mock_bedrock = MagicMock()
    agent._bedrock_client = mock_bedrock

    payload = {
        "content": [{"text": '{"status": "ok", "message": "success"}'}],
        "usage": {"input_tokens": 10, "output_tokens": 5},
    }
    body_stream = io.BytesIO(json.dumps(payload).encode("utf-8"))
    mock_bedrock.invoke_model.return_value = {"body": body_stream}

    result = agent.invoke("test prompt", SampleResponseSchema)

    assert isinstance(result, SampleResponseSchema)
    assert result.status == "ok"
    assert result.message == "success"


def test_base_agent_retry_and_exhaustion():
    """Test retry mechanism on exception and eventual failure."""
    agent = ConcreteAgent()
    mock_bedrock = MagicMock()
    agent._bedrock_client = mock_bedrock
    mock_bedrock.invoke_model.side_effect = Exception("API connection timeout")

    with pytest.raises(AgentInvocationError) as exc_info:
        agent.invoke("test prompt", SampleResponseSchema, max_retries=2, backoff_factor=0.01)

    assert "ConcreteAgent failed after 2 attempts" in str(exc_info.value)
