"""Patch Agent Implementation.

Generates autofix git diffs for identified vulnerabilities using LLMs.
"""

from typing import Any
import structlog
from pydantic import BaseModel, Field

from ai.agents.base import BaseAgent, AgentInvocationError

logger = structlog.get_logger(__name__)


class PatchResponse(BaseModel):
    """Pydantic schema for the generated patch."""
    diff_content: str = Field(description="The unified git diff content fixing the vulnerability.")
    explanation: str = Field(description="A brief explanation of how the patch fixes the issue.")


class PatchAgent(BaseAgent):
    """AI Agent responsible for generating security remediations."""

    def __init__(self, model_id: str = "anthropic.claude-3-5-sonnet-20240620-v1:0"):
        super().__init__(model_id=model_id, temperature=0.1)

    def generate_patch(self, vulnerability_title: str, code_snippet: str, description: str) -> PatchResponse:
        """Generate a patch for a specific vulnerability.
        
        Args:
            vulnerability_title: The title of the vulnerability.
            code_snippet: The vulnerable code.
            description: Description of the vulnerability.
            
        Returns:
            PatchResponse: The generated patch and explanation.
        """
        logger.info("patch_agent.generate_patch.started", vulnerability_title=vulnerability_title)
        
        prompt = f"""You are an expert security engineer. Your task is to fix a security vulnerability.
        
Vulnerability: {vulnerability_title}
Description: {description}

Vulnerable Code Snippet:
```
{code_snippet}
```

Please generate a unified git diff that fixes this vulnerability, and provide a brief explanation of the fix.
Output your response as JSON matching the following schema:
{{
    "diff_content": "--- a/file\\n+++ b/file\\n@@ ...",
    "explanation": "I fixed this by..."
}}
"""
        try:
            # We don't actually hit Bedrock in this mock MVP unless configured.
            # Using BaseAgent.invoke will trigger real AWS Bedrock calls.
            # If it fails (e.g. no AWS credentials), we'll fallback gracefully.
            response = self.invoke(prompt=prompt, response_schema=PatchResponse)
            return response
        except AgentInvocationError as e:
            logger.warning("patch_agent.generate_patch.llm_failed_falling_back_to_mock", error=str(e))
            # Fallback mock for local development without AWS credentials
            return PatchResponse(
                diff_content=f"--- a/file\n+++ b/file\n@@ -1 +1 @@\n- # vulnerable code\n+ # fixed {vulnerability_title}",
                explanation="This is a fallback mock explanation because AWS Bedrock invocation failed or is unconfigured."
            )

    def run(self, state: Any) -> dict[str, Any]:
        """LangGraph node interface (if used in a graph)."""
        pass
