"""Global State Schema for SecureCode AI Multi-Agent Workflow.

Defines Pydantic models for inter-agent state passing in LangGraph.
"""

from uuid import UUID
from typing import Any, Optional
from pydantic import BaseModel, Field


class AgentError(BaseModel):
    """Encapsulates an error encountered during agent execution."""

    agent_name: str
    error_code: str
    message: str
    details: Optional[dict[str, Any]] = None


class WorkflowMetadata(BaseModel):
    """Metadata tracking scan execution context."""

    request_id: Optional[str] = None
    started_at: Optional[str] = None
    model_version: Optional[str] = None
    total_tokens_used: int = 0


class WorkflowState(BaseModel):
    """Global state container passed across nodes in the LangGraph graph."""

    repository_id: UUID
    scan_id: Optional[str] = None
    repository_url: str = ""
    local_repo_path: str = ""
    branch: str = "main"
    file_tree: list[str] = Field(default_factory=list)
    scan_plan: Optional[Any] = None
    files_to_scan: list[str] = Field(default_factory=list)
    total_files: int = 0
    processed_files: int = 0
    findings: list[Any] = Field(default_factory=list)
    knowledge_context: list[Any] = Field(default_factory=list)
    patches: list[Any] = Field(default_factory=list)
    verifications: list[Any] = Field(default_factory=list)
    errors: list[AgentError] = Field(default_factory=list)
    security_retry_count: int = 0
    metadata: WorkflowMetadata = Field(default_factory=WorkflowMetadata)
