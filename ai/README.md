# Standalone AI Security Core (`ai/`)

## Architecture Overview
The `ai/` folder contains the autonomous AI engine decoupled from the web layer. It integrates LangGraph agent flows, AWS Bedrock / SageMaker LLMs, automated patch generation, multi-tool verification sandboxes, and QLoRA fine-tuning pipelines.

## Modules Summary
- `planner/`: LangGraph orchestration & execution graphs.
- `security/`: SAST, SCA, secret scanner, and code parser.
- `critic/`: False positive verification & review agent.
- `knowledge/`: RAG CVE vector store.
- `prompts/`: Prompt templates library.
- `training/`: Synthetic data generator & QLoRA trainer.
- `evaluation/`: CyberSecEval benchmarking & metrics.
- `patches/`: Autofix patch generator & diff applier.
- `verification/`: Multi-tool verification sandbox (Bandit, Semgrep, pytest).
- `memory/`: Short & long-term state tracking.
- `agents/`: Base agent interfaces.
- `utils/`: LLM factory & code cleaners.
