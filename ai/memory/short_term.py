"""Short-Term Memory Buffer for Agent Conversation Cycles."""

from typing import Any
from pydantic import BaseModel, Field


class Message(BaseModel):
    """Single conversation turn message."""

    role: str
    content: str


class ShortTermMemory(BaseModel):
    """In-memory sliding window conversation buffer for agent turns."""

    messages: list[Message] = Field(default_factory=list)
    max_turns: int = 10

    def add_message(self, role: str, content: str) -> None:
        """Append message turn and slice window to max_turns."""
        self.messages.append(Message(role=role, content=content))
        if len(self.messages) > self.max_turns:
            self.messages = self.messages[-self.max_turns :]

    def clear(self) -> None:
        """Reset conversation window."""
        self.messages.clear()
