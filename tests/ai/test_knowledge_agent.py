"""Unit tests for KnowledgeAgent, VectorRetriever, and Memory modules."""

import os
import sys
from uuid import uuid4
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.agents.state import WorkflowState
from ai.knowledge.agent import KnowledgeAgent
from ai.knowledge.retriever import VectorRetriever
from ai.knowledge.schemas import RetrievalResult
from ai.memory.short_term import ShortTermMemory
from ai.memory.long_term import LongTermMemory


def test_vector_retriever_search_sqli():
    """Verify retriever retrieves CWE-89 entry for SQL injection query."""
    retriever = VectorRetriever()
    result: RetrievalResult = retriever.search("SQL injection")

    assert len(result.entries) > 0
    top_match = result.entries[0]
    assert top_match.cwe_id == "CWE-89"


def test_vector_retriever_search_cwe_direct_match():
    """Verify retriever direct match on CWE ID query."""
    retriever = VectorRetriever()
    result: RetrievalResult = retriever.search("CWE-798")

    assert len(result.entries) > 0
    assert result.entries[0].cwe_id == "CWE-798"


def test_knowledge_agent_run_node():
    """Verify KnowledgeAgent run method updates state with knowledge context."""
    agent = KnowledgeAgent()
    state = WorkflowState(repository_id=uuid4())

    update = agent.run(state)
    assert "knowledge_context" in update
    assert len(update["knowledge_context"]) > 0


def test_short_term_memory_sliding_window():
    """Verify ShortTermMemory enforces max_turns sliding window."""
    mem = ShortTermMemory(max_turns=3)
    for i in range(5):
        mem.add_message("user", f"message {i}")

    assert len(mem.messages) == 3
    assert mem.messages[0].content == "message 2"
    assert mem.messages[2].content == "message 4"


def test_long_term_memory_store():
    """Verify LongTermMemory set/get operations."""
    mem = LongTermMemory()
    mem.set("repo_risk_score", 0.85)

    assert mem.get("repo_risk_score") == 0.85
    assert mem.get("non_existent_key", default=0.0) == 0.0
