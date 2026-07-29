"""LangGraph Conditional Edge Functions for Agent Orchestration Graph."""

from typing import Any
import structlog

logger = structlog.get_logger(__name__)

MAX_SECURITY_RETRIES = 2


def should_retry_security(state: Any) -> str:
    """Conditional edge evaluating whether Critic Agent rejected findings requiring re-analysis.

    Args:
        state: WorkflowState object or dictionary from LangGraph node execution.

    Returns:
        str: Target node name ('analyse_security' or '__end__').
    """
    if isinstance(state, dict):
        retry_count = state.get("security_retry_count", 0)
        findings = state.get("findings", [])
        errors = state.get("errors", [])
    else:
        retry_count = getattr(state, "security_retry_count", 0)
        findings = getattr(state, "findings", [])
        errors = getattr(state, "errors", [])

    # If critical errors occurred, terminate workflow
    if errors:
        logger.warning("edge.should_retry_security.errors_detected", error_count=len(errors))
        return "__end__"

    # If findings exist or max retries reached, complete workflow
    if len(findings) > 0 or retry_count >= MAX_SECURITY_RETRIES:
        logger.info("edge.should_retry_security.proceeding_to_end", findings_count=len(findings))
        return "__end__"

    logger.info("edge.should_retry_security.triggering_retry", attempt=retry_count + 1)
    return "analyse_security"
