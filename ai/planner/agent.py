"""Planner Agent Implementation.

Analyses repository structure, prioritizes high-risk files,
and constructs Pydantic ScanPlan batches for downstream agents.
"""

from typing import Any
import structlog

from ai.agents.base import BaseAgent
from ai.agents.state import WorkflowState, AgentError
from ai.planner.state import ScanPlan
from ai.planner.logic import construct_batches, calculate_risk_priority, classify_file_type
from ai.prompts.planner_prompts import PLANNER_SYSTEM_PROMPT

logger = structlog.get_logger(__name__)


class PlannerAgent(BaseAgent):
    """Planner Agent responsible for file classification and scan batch generation."""

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

    def generate_plan(self, file_tree: list[str]) -> ScanPlan:
        """Construct ScanPlan from repository file tree using classification heuristics.

        Args:
            file_tree: List of relative file path strings.

        Returns:
            ScanPlan: Validated execution plan with token-bounded batches.
        """
        logger.info("planner_agent.generate_plan.started", file_count=len(file_tree))

        if not file_tree:
            logger.warning("planner_agent.generate_plan.empty_file_tree")
            return ScanPlan(batches=[], total_files=0, estimated_tokens=0, high_risk_files_count=0)

        # 1. Compute batches via heuristic logic engine
        batches = construct_batches(file_tree, max_files_per_batch=50)

        # 2. Count high-risk target files
        high_risk_count = sum(
            1
            for path in file_tree
            if calculate_risk_priority(path, classify_file_type(path)) == 1
        )

        total_tokens = sum(batch.estimated_tokens for batch in batches)

        plan = ScanPlan(
            batches=batches,
            total_files=len(file_tree),
            estimated_tokens=total_tokens,
            high_risk_files_count=high_risk_count,
        )

        logger.info(
            "planner_agent.generate_plan.completed",
            batch_count=len(batches),
            high_risk_count=high_risk_count,
            total_tokens=total_tokens,
        )
        return plan

    def run(self, state: WorkflowState) -> dict[str, Any]:
        """Execute Planner Agent node within LangGraph workflow.

        Args:
            state: Global WorkflowState object.

        Returns:
            dict[str, Any]: State update dictionary containing key 'scan_plan'.
        """
        logger.info("planner_agent.run.started", repository_id=str(state.repository_id))
        try:
            plan = self.generate_plan(state.file_tree)
            return {"scan_plan": plan}
        except Exception as e:
            logger.error("planner_agent.run.failed", error=str(e))
            err = AgentError(
                agent_name="PlannerAgent",
                error_code="PLAN_GENERATION_FAILED",
                message=str(e),
            )
            return {"errors": state.errors + [err]}
