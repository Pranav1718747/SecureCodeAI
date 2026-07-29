"""Knowledge Agent Package.

Exports KnowledgeAgent, KnowledgeEntry, RetrievalResult, and VectorRetriever.
"""

from ai.knowledge.agent import KnowledgeAgent
from ai.knowledge.schemas import KnowledgeEntry, RetrievalResult
from ai.knowledge.retriever import VectorRetriever
from ai.knowledge.knowledge_base import load_default_knowledge_entries

__all__ = [
    "KnowledgeAgent",
    "KnowledgeEntry",
    "RetrievalResult",
    "VectorRetriever",
    "load_default_knowledge_entries",
]
