"""LangGraph StateGraph Multi-Agent Scan Orchestrator."""

from typing import Any
import structlog
from langgraph.graph import StateGraph, START, END

from ai.agents.state import WorkflowState
from ai.planner.agent import PlannerAgent
from ai.security.agent import SecurityAgent
from ai.knowledge.agent import KnowledgeAgent
from ai.critic.agent import CriticAgent
from ai.agents.edges import should_retry_security

logger = structlog.get_logger(__name__)


class ScanOrchestrator:
    """Orchestrates multi-agent security scanning workflow graph using LangGraph."""

    def __init__(self) -> None:
        self.planner_agent = PlannerAgent()
        self.security_agent = SecurityAgent()
        self.knowledge_agent = KnowledgeAgent()
        self.critic_agent = CriticAgent()
        self._compiled_graph: Any = None

    def build_graph(self) -> Any:
        """Construct and compile the LangGraph StateGraph directed graph.

        Returns:
            CompiledGraph: Runnable state graph.
        """
        logger.info("orchestrator.build_graph.started")
        workflow = StateGraph(WorkflowState)

        # 1. Add agent nodes
        workflow.add_node("plan_scan", self.planner_agent.run)
        workflow.add_node("analyse_security", self.security_agent.run)
        workflow.add_node("retrieve_knowledge", self.knowledge_agent.run)
        workflow.add_node("validate_findings", self.critic_agent.run)

        # 2. Add graph edges
        workflow.add_edge(START, "plan_scan")
        workflow.add_edge("plan_scan", "analyse_security")
        workflow.add_edge("analyse_security", "retrieve_knowledge")
        workflow.add_edge("retrieve_knowledge", "validate_findings")

        # 3. Add conditional routing edge
        workflow.add_conditional_edges(
            "validate_findings",
            should_retry_security,
            {
                "analyse_security": "analyse_security",
                "__end__": END,
            },
        )

        compiled = workflow.compile()
        logger.info("orchestrator.build_graph.completed")
        return compiled

    @property
    def graph(self) -> Any:
        """Lazy loaded compiled LangGraph graph."""
        if self._compiled_graph is None:
            self._compiled_graph = self.build_graph()
        return self._compiled_graph

    def run_scan(self, state: WorkflowState) -> WorkflowState:
        """Execute complete multi-agent scan graph over repository state.

        Args:
            state: Initial WorkflowState object.

        Returns:
            WorkflowState: Final state object containing scan plan, findings, and knowledge.
        """
        logger.info("orchestrator.run_scan.started", repository_id=str(state.repository_id))
        final_state_dict = self.graph.invoke(state)

        # Re-parse dictionary response back into WorkflowState Pydantic object if needed
        if isinstance(final_state_dict, dict):
            final_state = WorkflowState.model_validate(final_state_dict)
        else:
            final_state = final_state_dict

        logger.info(
            "orchestrator.run_scan.completed",
            repository_id=str(final_state.repository_id),
            findings_count=len(final_state.findings),
            errors_count=len(final_state.errors),
        )
        return final_state
