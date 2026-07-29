"""Knowledge Agent Schemas and RAG Search Result Models."""

from pydantic import BaseModel, Field


class KnowledgeEntry(BaseModel):
    """Pydantic model representing an authoritative OWASP/CWE knowledge base document."""

    id: str
    title: str
    cwe_id: str
    owasp_category: str
    summary: str
    remediation_guidance: str
    vector: list[float] = Field(default_factory=list)


class RetrievalResult(BaseModel):
    """Container model for vector similarity search results."""

    query: str
    entries: list[KnowledgeEntry] = Field(default_factory=list)
    similarity_scores: list[float] = Field(default_factory=list)
