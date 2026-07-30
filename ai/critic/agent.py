"""Critic Agent Implementation.

Validates security findings produced by SecurityAgent, scoring quality
and rejecting false positives or incomplete explanations.
"""

from typing import Any
import structlog

from ai.agents.base import BaseAgent
from ai.agents.state import WorkflowState, AgentError
from ai.security.schemas import Finding
from ai.critic.schemas import ValidationResult
from ai.critic.validators import validate_finding_rules
from ai.prompts.critic_prompts import CRITIC_SYSTEM_PROMPT

logger = structlog.get_logger(__name__)


class CriticAgent(BaseAgent):
    """Critic Agent responsible for quality assurance and false-positive filtering."""

    def __init__(
        self,
        model_id: str = "llama-3.1-8b-instant",
        temperature: float = 0.0,
        region_name: str = "us-east-1",
    ) -> None:
        super().__init__(
            model_id=model_id,
            temperature=temperature,
            region_name=region_name,
            max_tokens=4000,
        )

    def validate_finding(self, finding: Finding) -> ValidationResult:
        """Validate a single finding using deterministic rules.

        Args:
            finding: Finding object to validate.

        Returns:
            ValidationResult: Validation evaluation result.
        """
        logger.info("critic_agent.validate_finding.started", finding_id=str(finding.id))
        
        # First use deterministic rules to quickly filter obvious false positives
        rule_result = validate_finding_rules(finding)
        if not rule_result.is_valid:
            return rule_result

        # If rules pass, use LLM to critically evaluate the finding
        prompt = f"""You are a senior security critic. Evaluate the following vulnerability finding for false positives.
        
Finding Details:
- Title: {finding.vulnerability_type}
- Description: {finding.description}
- Severity: {finding.severity.value}
- Location: {finding.file_path}:{finding.line_number}

Analyze the finding and determine if it is a true positive (valid) or a false positive (invalid).
Output your response as JSON matching the following schema:
{{
    "is_valid": true/false,
    "rejection_code": "FALSE_POSITIVE" or "INCOMPLETE_EXPLANATION" or null if valid,
    "critic_notes": "Explanation of your reasoning"
}}
"""
        try:
            from ai.agents.base import AgentInvocationError
            result = self.invoke(prompt=prompt, response_schema=ValidationResult)
        except Exception as e:
            logger.warning("critic_agent.validate_finding.llm_failed_falling_back", error=str(e))
            # Fallback to rule result if LLM fails
            result = rule_result

        logger.info(
            "critic_agent.validate_finding.completed",
            finding_id=str(finding.id),
            is_valid=result.is_valid,
            rejection_code=result.rejection_code,
        )
        return result

    def filter_findings(self, findings: list[Finding]) -> tuple[list[Finding], list[ValidationResult]]:
        """Filter a list of findings, separating valid findings from rejections.

        Args:
            findings: Input list of findings.

        Returns:
            tuple[list[Finding], list[ValidationResult]]: (valid_findings, all_validation_results)
        """
        valid_findings: list[Finding] = []
        validation_results: list[ValidationResult] = []

        for finding in findings:
            result = self.validate_finding(finding)
            validation_results.append(result)
            if result.is_valid:
                valid_findings.append(finding)

        logger.info(
            "critic_agent.filter_findings.summary",
            total_input=len(findings),
            approved_count=len(valid_findings),
            rejected_count=len(findings) - len(valid_findings),
        )
        return valid_findings, validation_results

    def run(self, state: WorkflowState) -> dict[str, Any]:
        """Execute Critic Agent node within LangGraph workflow graph.

        Args:
            state: Global WorkflowState object.

        Returns:
            dict[str, Any]: State update dictionary with filtered 'findings'.
        """
        logger.info("critic_agent.run.started", repository_id=str(state.repository_id))
        try:
            valid_findings, validation_results = self.filter_findings(state.findings)
            return {
                "findings": valid_findings,
            }
        except Exception as e:
            logger.error("critic_agent.run.failed", error=str(e))
            err = AgentError(
                agent_name="CriticAgent",
                error_code="VALIDATION_FAILED",
                message=str(e),
            )
            return {"errors": state.errors + [err]}
