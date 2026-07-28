# AI Module: Planner

## Purpose
Orchestrates multi-agent security analysis state graphs using LangGraph.

## Key Components
- `planner.py`: LangGraph Planner Agent: Orchestrates execution plans for security scans and code remediation.
- `workflow.py`: LangGraph stateful workflow graph builder connecting Security, Critic, and Patch agents.
- `router.py`: Intent and task routing logic for delegating sub-tasks to specialized sub-agents.
- `state.py`: LangGraph state schema definition holding repository context, AST, findings, and patch drafts.
