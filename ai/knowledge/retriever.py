"""Vector and Text Similarity Retriever for Knowledge Agent."""

import math
from ai.knowledge.schemas import KnowledgeEntry, RetrievalResult
from ai.knowledge.knowledge_base import load_default_knowledge_entries


def compute_text_similarity(query: str, text: str) -> float:
    """Compute keyword overlap similarity score between query and target text.

    Args:
        query: User search query string.
        text: Target document content.

    Returns:
        float: Similarity score between 0.0 and 1.0.
    """
    query_words = set(query.lower().split())
    text_words = set(text.lower().split())

    if not query_words or not text_words:
        return 0.0

    intersection = query_words.intersection(text_words)
    union = query_words.union(text_words)
    return len(intersection) / len(union) if union else 0.0


class VectorRetriever:
    """In-memory similarity retriever for OWASP/CWE knowledge base."""

    def __init__(self, entries: list[KnowledgeEntry] | None = None) -> None:
        """Initialize retriever with knowledge entries.

        Args:
            entries: List of KnowledgeEntry objects. Defaults to built-in OWASP catalog.
        """
        self.entries = entries if entries is not None else load_default_knowledge_entries()

    def search(
        self, query: str, top_k: int = 5, min_score: float = 0.01
    ) -> RetrievalResult:
        """Execute text similarity search over knowledge base entries.

        Args:
            query: Search query string (e.g. 'SQL injection' or 'CWE-89').
            top_k: Maximum number of results to return.
            min_score: Minimum similarity score threshold.

        Returns:
            RetrievalResult: Result object containing matched entries and scores.
        """
        scored_entries: list[tuple[KnowledgeEntry, float]] = []

        query_lower = query.lower()
        for entry in self.entries:
            # Match directly on CWE ID or OWASP category if present
            if query_lower in entry.cwe_id.lower() or query_lower in entry.title.lower():
                score = 0.95
            else:
                combined_text = f"{entry.title} {entry.summary} {entry.remediation_guidance}"
                score = compute_text_similarity(query, combined_text)

            if score >= min_score:
                scored_entries.append((entry, score))

        # Sort descending by score
        scored_entries.sort(key=lambda item: item[1], reverse=True)
        top_matches = scored_entries[:top_k]

        matched_entries = [item[0] for item in top_matches]
        scores = [item[1] for item in top_matches]

        return RetrievalResult(
            query=query,
            entries=matched_entries,
            similarity_scores=scores,
        )
