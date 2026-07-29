"""Long-Term Persistent Memory Store for Cross-Scan Agent Knowledge."""

from typing import Any, Optional
from pydantic import BaseModel, Field


class LongTermMemoryEntry(BaseModel):
    """Persistent knowledge record across multiple repository scans."""

    key: str
    value: Any
    created_at: str


class LongTermMemory(BaseModel):
    """Persistent key-value knowledge memory store."""

    records: dict[str, Any] = Field(default_factory=dict)

    def set(self, key: str, value: Any) -> None:
        """Store persistent key-value pair."""
        self.records[key] = value

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        """Retrieve persistent value by key."""
        return self.records.get(key, default)
