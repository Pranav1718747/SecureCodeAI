"""Security Agent Implementation.

Performs OWASP Top 10 and CWE vulnerability analysis over code files using
heuristic rule pattern matching and LLM reasoning. Supports both single-file
and batch multi-file analysis for performance.
"""

from typing import Any, Optional
import structlog

from ai.agents.base import BaseAgent, AgentInvocationError
from ai.agents.state import WorkflowState, AgentError
from ai.security.schemas import Finding, SecurityAnalysisResult
from ai.security.detectors import scan_file_heuristics
from ai.prompts.security_prompts import SECURITY_SYSTEM_PROMPT, SECURITY_BATCH_PROMPT

logger = structlog.get_logger(__name__)


class SecurityAgent(BaseAgent):
    """Security Agent responsible for vulnerability detection across code batches."""

    def __init__(
        self,
        model_id: str = "llama-3.1-8b-instant",
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
        """Analyze a single code file using heuristic detectors and LLM.

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

        # 2. Invoke LLM for deep logical reasoning
        import os
        _, ext = os.path.splitext(file_path)
        language = ext.lstrip(".") or "plaintext"
        
        prompt = SECURITY_SYSTEM_PROMPT.format(
            file_path=file_path,
            language=language,
            knowledge_context=knowledge_context or "No additional context.",
            source_code=content
        )
        
        try:
            llm_result = self.invoke(prompt=prompt, response_schema=SecurityAnalysisResult)
            if llm_result and hasattr(llm_result, "findings"):
                findings.extend(llm_result.findings)
        except Exception as e:
            logger.warning("security_agent.analyze_file.llm_failed", file_path=file_path, error=str(e))

        # 3. Filter findings below confidence threshold
        valid_findings = [
            f for f in findings if f.confidence >= self.confidence_threshold
        ]

        logger.info(
            "security_agent.analyze_file.completed",
            file_path=file_path,
            findings_count=len(valid_findings),
        )
        return valid_findings

    def analyze_batch(
        self, files: dict[str, str]
    ) -> list[Finding]:
        """Analyze multiple files in a single LLM request.

        Args:
            files: Dictionary mapping file_path -> source_code_content.

        Returns:
            list[Finding]: All findings from all files above confidence threshold.
        """
        if not files:
            return []
            
        file_paths = list(files.keys())
        logger.info("security_agent.analyze_batch.started", file_count=len(files), files=file_paths)

        # 1. Run heuristic detectors on each file (fast, no LLM)
        all_findings: list[Finding] = []
        for file_path, content in files.items():
            heuristic_findings = scan_file_heuristics(file_path, content)
            all_findings.extend(heuristic_findings)

        # 2. Build batched prompt with all files in XML blocks
        files_block_parts = []
        for file_path, content in files.items():
            # Truncate very large files to avoid blowing up context
            truncated = content[:8000] if len(content) > 8000 else content
            files_block_parts.append(
                f"<file path=\"{file_path}\">\n{truncated}\n</file>"
            )
        files_block = "\n\n".join(files_block_parts)

        prompt = SECURITY_BATCH_PROMPT.format(files_block=files_block)

        # 3. Single LLM call for the entire batch
        try:
            llm_result = self.invoke(prompt=prompt, response_schema=SecurityAnalysisResult)
            if llm_result and hasattr(llm_result, "findings"):
                all_findings.extend(llm_result.findings)
        except Exception as e:
            logger.warning(
                "security_agent.analyze_batch.llm_failed",
                file_count=len(files),
                error=str(e)
            )

        # 4. Filter below confidence threshold
        valid_findings = [
            f for f in all_findings if f.confidence >= self.confidence_threshold
        ]

        logger.info(
            "security_agent.analyze_batch.completed",
            file_count=len(files),
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
                        import os
                        full_path = os.path.join(state.local_repo_path, file_path)
                        try:
                            with open(full_path, "r", encoding="utf-8") as f:
                                content = f.read()
                        except Exception as e:
                            logger.warning("security_agent.read_failed", file=file_path, error=str(e))
                            continue
                            
                        new_findings = self.analyze_file_content(
                            file_path, content
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

    def generate_analysis(self, vuln) -> Any:
        """Generate a detailed contextual analysis report for a specific vulnerability.

        Always returns a structured response — either from Groq or deterministic fallback.
        Never raises to the caller.
        """
        logger.info("security_agent.generate_analysis.started", vuln_title=vuln.title)

        from pydantic import BaseModel, Field
        class AnalysisResponse(BaseModel):
            summary: str = Field(description="A short summary of the vulnerability and where it was found.")
            attack_scenario: str = Field(description="A step-by-step walkthrough of how an attacker could exploit this.")
            business_impact: str = Field(description="The potential business impact of an exploit.")
            compliance_impact: str = Field(description="Any compliance frameworks (SOC2, GDPR, PCI-DSS) violated by this.")
            remediation: str = Field(description="Step-by-step instructions on how to fix the vulnerability.")
            secure_example: str = Field(description="A secure code example for the fix.")
            confidence: int = Field(description="Confidence score (0-100).")

        prompt = f"""You are a Principal Application Security Engineer. Your task is to generate a detailed contextual analysis report for a specific vulnerability.

### Vulnerability Context
- **Title:** {vuln.title}
- **Severity:** {vuln.severity}
- **CWE:** {vuln.cwe_id or 'Unknown'}
- **OWASP:** {vuln.owasp_category or 'Unknown'}
- **File:** {vuln.file_path}
- **Vulnerable Line:** {vuln.line_start}
- **Description:** {vuln.description}

### Snippet
```
{vuln.snippet}
```

Generate a deep dive analysis of this specific vulnerability in this specific file.
Output your response as structured JSON matching the provided schema exactly.
"""
        try:
            response, metadata = self.invoke_with_metadata(
                prompt=prompt, response_schema=AnalysisResponse
            )
            logger.info(
                "security_agent.generate_analysis.completed",
                vuln_title=vuln.title,
                retry_count=metadata.get("retry_count", 0),
                latency_ms=metadata.get("latency_ms"),
            )
            return response, {**metadata, "status": "success", "source": "groq"}
        except AgentInvocationError as e:
            logger.warning(
                "security_agent.generate_analysis.fallback",
                vuln_title=vuln.title,
                error=str(e),
                retry_count=e.retry_count,
            )
            from ai.security.report_generator import generate_full_report
            fallback = generate_full_report(vuln)
            return fallback, {
                "status": "fallback",
                "source": "deterministic",
                "reason": f"Groq unavailable after {e.retry_count} retries: {e}",
                "retry_count": e.retry_count,
            }

