"""Base Agent Abstraction for Amazon Bedrock Invocations.

Provides robust LLM calls, exponential backoff retry mechanisms,
and Pydantic response parsing for all reasoning agents.
"""

import json
import time
from abc import ABC, abstractmethod
from typing import Type, TypeVar, Any, Optional

import structlog
from pydantic import BaseModel, ValidationError

logger = structlog.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)


class AgentInvocationError(Exception):
    """Raised when an agent invocation fails after retries."""

    def __init__(self, message: str, original_exception: Optional[Exception] = None):
        super().__init__(message)
        self.original_exception = original_exception


class BaseAgent(ABC):
    """Abstract Base Class for all SecureCode AI LLM Reasoning Agents."""

    def __init__(
        self,
        model_id: str = "anthropic.claude-3-5-sonnet-20240620-v1:0",
        temperature: float = 0.0,
        region_name: str = "us-east-1",
        max_tokens: int = 4096,
    ) -> None:
        """Initialize BaseAgent with Bedrock parameters.

        Args:
            model_id: AWS Bedrock model identifier.
            temperature: Sampling temperature (0.0 for deterministic reasoning).
            region_name: AWS region for Bedrock service.
            max_tokens: Maximum tokens in response.
        """
        self.model_id = model_id
        self.temperature = temperature
        self.region_name = region_name
        self.max_tokens = max_tokens
        self._bedrock_client: Any = None

    @property
    def client(self) -> Any:
        """Lazy load boto3 Bedrock Runtime client."""
        if self._bedrock_client is None:
            import boto3

            self._bedrock_client = boto3.client(
                service_name="bedrock-runtime",
                region_name=self.region_name,
            )
        return self._bedrock_client

    def invoke(
        self,
        prompt: str,
        response_schema: Type[T],
        max_retries: int = 3,
        backoff_factor: float = 2.0,
    ) -> T:
        """Invoke LLM with prompt and parse structured output into Pydantic model.

        Args:
            prompt: Text prompt formatted with system/context/task tags.
            response_schema: Target Pydantic model class.
            max_retries: Number of retry attempts on failure.
            backoff_factor: Multiplier for exponential backoff delay.

        Returns:
            T: Instance of target Pydantic response schema.

        Raises:
            AgentInvocationError: If invocation or parsing fails after retries.
        """
        log = logger.bind(
            agent=self.__class__.__name__,
            model_id=self.model_id,
            schema=response_schema.__name__,
        )
        log.info("agent_invocation.started")

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        })

        delay = 1.0
        last_exception: Optional[Exception] = None

        for attempt in range(1, max_retries + 1):
            try:
                response = self.client.invoke_model(
                    modelId=self.model_id,
                    contentType="application/json",
                    accept="application/json",
                    body=body,
                )

                response_body = json.loads(response.get("body").read().decode("utf-8"))
                completion_text = (
                    response_body.get("content", [{}])[0].get("text", "")
                )

                parsed_result = self._parse_response(
                    completion_text, response_schema
                )

                input_tokens = response_body.get("usage", {}).get("input_tokens", 0)
                output_tokens = response_body.get("usage", {}).get("output_tokens", 0)

                log.info(
                    "agent_invocation.completed",
                    attempt=attempt,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                )
                return parsed_result

            except Exception as e:
                last_exception = e
                is_boto_err = e.__class__.__name__ in ("BotoCoreError", "ClientError")
                log_event = "agent_invocation.api_error" if is_boto_err else "agent_invocation.error"
                log.warning(
                    log_event,
                    attempt=attempt,
                    error=str(e),
                    next_retry_delay=delay,
                )

            if attempt < max_retries:
                time.sleep(delay)
                delay *= backoff_factor

        log.error("agent_invocation.failed_all_retries", max_retries=max_retries)
        raise AgentInvocationError(
            f"Agent {self.__class__.__name__} failed after {max_retries} attempts.",
            original_exception=last_exception,
        )

    def _parse_response(
        self, completion_text: str, response_schema: Type[T]
    ) -> T:
        """Extract and parse JSON payload into Pydantic model.

        Handles plain JSON string or markdown-fenced ```json ... ``` blocks.
        """
        clean_text = completion_text.strip()
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```")[1].split("```")[0].strip()

        data = json.loads(clean_text)
        return response_schema.model_validate(data)

    @abstractmethod
    def run(self, state: Any) -> dict[str, Any]:
        """Execute agent task within LangGraph workflow graph."""
        pass
