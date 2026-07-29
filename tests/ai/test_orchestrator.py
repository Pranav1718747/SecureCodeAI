"""Integration tests for ScanOrchestrator LangGraph multi-agent scan execution."""

import os
import sys
from uuid import uuid4
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.agents.state import WorkflowState
from ai.agents.orchestrator import ScanOrchestrator
from ai.agents.edges import should_retry_security


def test_should_retry_security_edge_normal():
    """Verify conditional edge routes to __end__ when findings exist."""
    state = {
        "security_retry_count": 0,
        "findings": [{"id": "f1"}],
        "errors": [],
    }
    target = should_retry_security(state)
    assert target == "__end__"


def test_should_retry_security_edge_max_retries():
    """Verify conditional edge routes to __end__ when max retries exceeded."""
    state = {
        "security_retry_count": 2,
        "findings": [],
        "errors": [],
    }
    target = should_retry_security(state)
    assert target == "__end__"


def test_should_retry_security_edge_retry_trigger():
    """Verify conditional edge triggers re-analysis when findings empty and count < 2."""
    state = {
        "security_retry_count": 0,
        "findings": [],
        "errors": [],
    }
    target = should_retry_security(state)
    assert target == "analyse_security"


def test_scan_orchestrator_build_graph():
    """Verify ScanOrchestrator compiles state graph without errors."""
    orchestrator = ScanOrchestrator()
    graph = orchestrator.graph
    assert graph is not None


def test_scan_orchestrator_run_scan_execution():
    """Verify full end-to-end graph execution runs all nodes."""
    orchestrator = ScanOrchestrator()
    initial_state = WorkflowState(
        repository_id=uuid4(),
        file_tree=["backend/auth.py", "backend/views.py", "db/schema.sql"],
    )

    final_state = orchestrator.run_scan(initial_state)

    assert isinstance(final_state, WorkflowState)
    assert final_state.scan_plan is not None
    assert len(final_state.scan_plan.batches) == 1
    assert isinstance(final_state.knowledge_context, list)
    assert len(final_state.knowledge_context) > 0
