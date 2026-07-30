"""Base Agent Abstraction for Groq LLM Invocations.

Provides robust LLM calls, smart retry classification (retryable vs
non-retryable errors), exponential backoff, and Pydantic response
parsing for all reasoning agents.
"""

import json
import time
import uuid
from abc import ABC, abstractmethod
from typing import Type, TypeVar, Any, Optional

import structlog
from pydantic import BaseModel, ValidationError

logger = structlog.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)


# ---------------------------------------------------------------------------
# Error Classification
# ---------------------------------------------------------------------------

# Exceptions that should NEVER be retried (fail immediately)
_NON_RETRYABLE_TYPES = (
    ValueError,          # missing API key, bad config
    ValidationError,     # pydantic parse failure
    json.JSONDecodeError,
)

# Groq SDK error names that are non-retryable
_NON_RETRYABLE_GROQ_NAMES = {"AuthenticationError", "BadRequestError"}

# Groq SDK error names that ARE retryable
_RETRYABLE_GROQ_NAMES = {"RateLimitError", "APIConnectionError", "APITimeoutError"}

# HTTP status codes that are retryable
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def _is_retryable(exc: Exception) -> bool:
    """Return True if the exception is worth retrying."""
    # Explicit non-retryable types
    if isinstance(exc, _NON_RETRYABLE_TYPES):
        return False

    exc_name = type(exc).__name__

    # Groq SDK non-retryable
    if exc_name in _NON_RETRYABLE_GROQ_NAMES:
        return False

    # Groq SDK retryable
    if exc_name in _RETRYABLE_GROQ_NAMES:
        return True

    # Groq APIStatusError — check HTTP status code
    status_code = getattr(exc, "status_code", None)
    if status_code is not None:
        return status_code in _RETRYABLE_STATUS_CODES

    # Python stdlib network errors
    if isinstance(exc, (ConnectionError, TimeoutError, OSError)):
        return True

    # Default: retry unknown errors (safer than crashing)
    return True


class AgentInvocationError(Exception):
    """Raised when an agent invocation fails after retries."""

    def __init__(self, message: str, original_exception: Optional[Exception] = None,
                 retry_count: int = 0, is_retryable_failure: bool = True):
        super().__init__(message)
        self.original_exception = original_exception
        self.retry_count = retry_count
        self.is_retryable_failure = is_retryable_failure


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
        result, _ = self.invoke_with_metadata(
            prompt=prompt,
            response_schema=response_schema,
            max_retries=max_retries,
            backoff_factor=backoff_factor,
        )
        return result

    def invoke_with_metadata(
        self,
        prompt: str,
        response_schema: Type[T],
        max_retries: int = 3,
        backoff_factor: float = 2.0,
    ) -> tuple[T, dict]:
        """Invoke LLM and return (parsed_result, metadata).

        metadata keys: request_id, source, status, retry_count,
        latency_ms, prompt_tokens, completion_tokens, model_id, error.
        """
        request_id = str(uuid.uuid4())[:8]
        log = logger.bind(
            agent=self.__class__.__name__,
            model_id=self.model_id,
            schema=response_schema.__name__,
            request_id=request_id,
        )
        log.info("agent_invocation.started")

        delay = 1.0
        last_exception: Optional[Exception] = None
        attempts_made = 0
        start_time = time.monotonic()

        for attempt in range(1, max_retries + 1):
            attempts_made = attempt
            attempt_start = time.monotonic()
            try:
                schema_dict = response_schema.model_json_schema()
                schema_str = json.dumps(schema_dict, indent=2)
                enriched_prompt = f"{prompt}\n\nYou MUST return a valid JSON object matching this JSON Schema exactly:\n{schema_str}"

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

                usage = getattr(response, 'usage', None)
                input_tokens = usage.prompt_tokens if usage else 0
                output_tokens = usage.completion_tokens if usage else 0
                latency_ms = round((time.monotonic() - attempt_start) * 1000)

                log.info(
                    "agent_invocation.completed",
                    attempt=attempt,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    latency_ms=latency_ms,
                )

                metadata = {
                    "request_id": request_id,
                    "source": "groq",
                    "status": "success",
                    "retry_count": attempt - 1,
                    "latency_ms": round((time.monotonic() - start_time) * 1000),
                    "prompt_tokens": input_tokens,
                    "completion_tokens": output_tokens,
                    "model_id": self.model_id,
                    "error": None,
                }
                return parsed_result, metadata

            except Exception as e:
                last_exception = e
                latency_ms = round((time.monotonic() - attempt_start) * 1000)

                # Non-retryable: fail immediately
                if not _is_retryable(e):
                    log.error(
                        "agent_invocation.non_retryable_error",
                        attempt=attempt,
                        error=str(e),
                        error_type=type(e).__name__,
                        latency_ms=latency_ms,
                    )
                    raise AgentInvocationError(
                        f"Agent {self.__class__.__name__} hit non-retryable error: {e}",
                        original_exception=e,
                        retry_count=attempt - 1,
                        is_retryable_failure=False,
                    ) from e

                # Retryable: log and backoff
                log.warning(
                    "agent_invocation.retryable_error",
                    attempt=attempt,
                    error=str(e),
                    error_type=type(e).__name__,
                    next_retry_delay=delay if attempt < max_retries else None,
                    latency_ms=latency_ms,
                )

            if attempt < max_retries:
                time.sleep(delay)
                delay *= backoff_factor

        total_latency = round((time.monotonic() - start_time) * 1000)
        log.error(
            "agent_invocation.failed_all_retries",
            max_retries=max_retries,
            total_latency_ms=total_latency,
        )
        raise AgentInvocationError(
            f"Agent {self.__class__.__name__} failed after {max_retries} retries.",
            original_exception=last_exception,
            retry_count=attempts_made,
            is_retryable_failure=True,
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
