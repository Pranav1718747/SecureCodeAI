"""Knowledge Agent Implementation.

Retrieves authoritative OWASP/CWE context from vector store to enrich LLM prompts.
"""

from typing import Any
import structlog

from ai.agents.base import BaseAgent
from ai.agents.state import WorkflowState, AgentError
from ai.knowledge.schemas import KnowledgeEntry, RetrievalResult
from ai.knowledge.retriever import VectorRetriever

logger = structlog.get_logger(__name__)


class KnowledgeAgent(BaseAgent):
    """Knowledge Agent responsible for RAG context retrieval."""

    def __init__(
        self,
        model_id: str = "llama-3.3-70b-versatile",
        temperature: float = 0.0,
        region_name: str = "us-east-1",
    ) -> None:
        super().__init__(
            model_id=model_id,
            temperature=temperature,
            region_name=region_name,
            max_tokens=4000,
        )
        self.retriever = VectorRetriever()

    def retrieve_context(self, query: str, top_k: int = 3) -> list[KnowledgeEntry]:
        """Retrieve relevant knowledge entries for a query string.

        Args:
            query: Topic or vulnerability query string.
            top_k: Number of entries to return.

        Returns:
            list[KnowledgeEntry]: Top matched knowledge entries.
        """
        logger.info("knowledge_agent.retrieve_context.started", query=query)
        result: RetrievalResult = self.retriever.search(query, top_k=top_k)
        logger.info(
            "knowledge_agent.retrieve_context.completed",
            query=query,
            matches_found=len(result.entries),
        )
        return result.entries

    def run(self, state: WorkflowState) -> dict[str, Any]:
        """Execute Knowledge Agent node within LangGraph workflow graph.

        Args:
            state: Global WorkflowState object.

        Returns:
            dict[str, Any]: State update dictionary with 'knowledge_context'.
        """
        logger.info("knowledge_agent.run.started", repository_id=str(state.repository_id))
        try:
            # Build queries from existing findings or default scan plan
            queries: list[str] = []
            if state.findings:
                queries = [f.vulnerability_type for f in state.findings]
            else:
                queries = ["SQL injection", "Cross-Site Scripting", "Hardcoded Credentials"]

            all_entries: list[KnowledgeEntry] = []
            seen_ids: set[str] = set()

            for query in queries:
                entries = self.retrieve_context(query, top_k=2)
                for entry in entries:
                    if entry.id not in seen_ids:
                        seen_ids.add(entry.id)
                        all_entries.append(entry)

            logger.info("knowledge_agent.run.completed", total_context_entries=len(all_entries))
            return {
                "knowledge_context": all_entries,
            }

        except Exception as e:
            logger.error("knowledge_agent.run.failed", error=str(e))
            err = AgentError(
                agent_name="KnowledgeAgent",
                error_code="RETRIEVAL_FAILED",
                message=str(e),
            )
            return {"errors": state.errors + [err]}
