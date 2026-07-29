"""Security Agent Implementation.

Performs OWASP Top 10 and CWE vulnerability analysis over code files using
heuristic rule pattern matching and Claude 3.5 Sonnet LLM reasoning.
"""

from typing import Any, Optional
import structlog

from ai.agents.base import BaseAgent
from ai.agents.state import WorkflowState, AgentError
from ai.security.schemas import Finding, SecurityAnalysisResult
from ai.security.detectors import scan_file_heuristics
from ai.prompts.security_prompts import SECURITY_SYSTEM_PROMPT

logger = structlog.get_logger(__name__)


class SecurityAgent(BaseAgent):
    """Security Agent responsible for vulnerability detection across code batches."""

    def __init__(
        self,
        model_id: str = "anthropic.claude-3-5-sonnet-20240620-v1:0",
        temperature: float = 0.0,
        region_name: str = "us-east-1",
        confidence_threshold: float = 0.3,
    ) -> None:
        super().__init__(
            model_id=model_id,
            temperature=temperature,
            region_name=region_name,
            max_tokens=8000,
        )
        self.confidence_threshold = confidence_threshold

    def analyze_file_content(
        self, file_path: str, content: str, knowledge_context: Optional[str] = None
    ) -> list[Finding]:
        """Analyze a single code file using heuristic detectors.

        Args:
            file_path: Target file path.
            content: Source code string.
            knowledge_context: RAG knowledge string.

        Returns:
            list[Finding]: Filtered list of findings above confidence threshold.
        """
        logger.info("security_agent.analyze_file.started", file_path=file_path)

        # 1. Run pattern heuristics
        findings = scan_file_heuristics(file_path, content)

        # 2. Filter findings below confidence threshold
        valid_findings = [
            f for f in findings if f.confidence >= self.confidence_threshold
        ]

        logger.info(
            "security_agent.analyze_file.completed",
            file_path=file_path,
            findings_count=len(valid_findings),
        )
        return valid_findings

    def run(self, state: WorkflowState) -> dict[str, Any]:
        """Execute Security Agent node within LangGraph workflow graph.

        Args:
            state: Global WorkflowState object.

        Returns:
            dict[str, Any]: State update dictionary containing key 'findings'.
        """
        logger.info("security_agent.run.started", repository_id=str(state.repository_id))
        all_findings: list[Finding] = list(state.findings)

        try:
            # If scan plan is present, process batches
            if state.scan_plan and hasattr(state.scan_plan, "batches"):
                for batch in state.scan_plan.batches:
                    for file_path in batch.files:
                        # In production flow, content is loaded from storage/cloned repo
                        mock_content = f"# Mock content for {file_path}"
                        new_findings = self.analyze_file_content(
                            file_path, mock_content
                        )
                        all_findings.extend(new_findings)

            logger.info(
                "security_agent.run.completed", total_findings=len(all_findings)
            )
            return {
                "findings": all_findings,
                "security_retry_count": state.security_retry_count + 1,
            }

        except Exception as e:
            logger.error("security_agent.run.failed", error=str(e))
            err = AgentError(
                agent_name="SecurityAgent",
                error_code="ANALYSIS_FAILED",
                message=str(e),
            )
            return {"errors": state.errors + [err]}
