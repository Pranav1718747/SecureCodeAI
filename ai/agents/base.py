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
        model_id: str = "llama-3.1-8b-instant",
        temperature: float = 0.0,
        region_name: str = "us-east-1",  # Kept for backward compatibility
        max_tokens: int = 4096,
    ) -> None:
        """Initialize BaseAgent with Groq parameters.

        Args:
            model_id: Groq model identifier.
            temperature: Sampling temperature (0.0 for deterministic reasoning).
            region_name: Kept for compatibility.
            max_tokens: Maximum tokens in response.
        """
        self.model_id = model_id
        self.temperature = temperature
        self.max_tokens = max_tokens
        self._groq_client: Any = None

    @property
    def client(self) -> Any:
        """Lazy load Groq client."""
        if self._groq_client is None:
            import os
            from groq import Groq
            
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable is missing.")
                
            self._groq_client = Groq(api_key=api_key)
        return self._groq_client

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

        delay = 1.0
        last_exception: Optional[Exception] = None

        for attempt in range(1, max_retries + 1):
            try:
                import json
                schema_dict = response_schema.model_json_schema()
                schema_str = json.dumps(schema_dict, indent=2)
                enriched_prompt = f"{prompt}\n\nYou MUST return a valid JSON object matching this JSON Schema exactly:\n{schema_str}"

                # Tell Groq we want JSON output if it's supported, else instruct it
                response = self.client.chat.completions.create(
                    model=self.model_id,
                    messages=[
                        {"role": "user", "content": enriched_prompt}
                    ],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    response_format={"type": "json_object"}
                )

                completion_text = response.choices[0].message.content

                parsed_result = self._parse_response(
                    completion_text, response_schema
                )

                # Assuming usage metrics exist on groq response object
                usage = getattr(response, 'usage', None)
                input_tokens = usage.prompt_tokens if usage else 0
                output_tokens = usage.completion_tokens if usage else 0

                log.info(
                    "agent_invocation.completed",
                    attempt=attempt,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                )
                return parsed_result

            except Exception as e:
                last_exception = e
                log_event = "agent_invocation.error"
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
