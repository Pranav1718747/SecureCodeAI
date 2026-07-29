"""Unit tests for PlannerAgent, file classification, and batching logic."""

import os
import sys
from uuid import uuid4
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.agents.state import WorkflowState
from ai.planner.agent import PlannerAgent
from ai.planner.state import FileType, ScanPlan
from ai.planner.logic import classify_file_type, calculate_risk_priority, construct_batches


def test_classify_file_type():
    """Verify file extension categorization."""
    assert classify_file_type("app/views.py") == FileType.PYTHON
    assert classify_file_type("src/index.ts") == FileType.TYPESCRIPT
    assert classify_file_type("db/schema.sql") == FileType.SQL
    assert classify_file_type(".env") == FileType.CONFIG
    assert classify_file_type("readme.md") == FileType.OTHER


def test_calculate_risk_priority():
    """Verify high-risk security files receive priority 1."""
    assert calculate_risk_priority("backend/auth/login.py", FileType.PYTHON) == 1
    assert calculate_risk_priority("config/secrets.env", FileType.CONFIG) == 1
    assert calculate_risk_priority("backend/models.py", FileType.PYTHON) == 2
    assert calculate_risk_priority("public/index.html", FileType.HTML) == 3


def test_construct_batches_empty():
    """Test batching logic on empty file tree."""
    batches = construct_batches([])
    assert batches == []


def test_construct_batches_under_limit():
    """Test small repository produces single batch."""
    files = ["app.py", "auth.py", "db.sql", "settings.env", "index.html"]
    batches = construct_batches(files, max_files_per_batch=50)

    assert len(batches) == 1
    assert len(batches[0].files) == 5
    assert batches[0].batch_id == 1


def test_construct_batches_over_limit():
    """Test large repository produces multiple batches with max 50 files per batch."""
    files = [f"file_{i}.py" for i in range(125)]
    batches = construct_batches(files, max_files_per_batch=50)

    assert len(batches) == 3
    assert len(batches[0].files) == 50
    assert len(batches[1].files) == 50
    assert len(batches[2].files) == 25


def test_planner_agent_run():
    """Test PlannerAgent run method updates WorkflowState."""
    agent = PlannerAgent()
    state = WorkflowState(
        repository_id=uuid4(),
        file_tree=["backend/auth.py", "backend/views.py", "db/schema.sql"],
    )

    update = agent.run(state)
    assert "scan_plan" in update
    plan: ScanPlan = update["scan_plan"]
    assert plan.total_files == 3
    assert plan.high_risk_files_count == 2
    assert len(plan.batches) == 1
