"""Agent Error Handling and Recovery Definitions."""

from typing import Optional
from ai.agents.state import AgentError


class AgentWorkflowError(Exception):
    """Raised when an unrecoverable error occurs during agent graph orchestration."""

    def __init__(self, message: str, agent_error: Optional[AgentError] = None):
        super().__init__(message)
        self.agent_error = agent_error
