# SecureCodeAI - Production-Grade AI Security Engineer Platform

## Overview
SecureCodeAI is an enterprise-level, autonomous AI-powered Security Engineer platform designed to automate repository static analysis, vulnerability detection (OWASP Top 10, CWE, secret leaks, vulnerable dependencies), automated patch generation (autofix), multi-tool dynamic verification (Bandit, Semgrep, pytest), and LLM fine-tuning/evaluation loops.

## System Architecture Overview
The system follows a modular microservice-ready monolith architecture cleanly separating four main layers:
- **Frontend (`frontend/`)**: React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, and ShadCN UI.
- **Backend (`backend/`)**: Django REST Framework, PostgreSQL, Redis, and Celery background worker queues.
- **AI Core (`ai/`)**: Autonomous multi-agent graph workflows using LangGraph, LangChain, Amazon Bedrock, SageMaker, HuggingFace, PEFT, and QLoRA fine-tuning pipelines.
- **Infrastructure & Docs (`docker/`, `nginx/`, `scripts/`, `docs/`, `.github/`)**: Containerized deployment with Docker Compose, Nginx reverse proxy, AWS cloud manifests, and CI/CD pipelines.

## Getting Started
See [docs/architecture.md](docs/architecture.md) for full architectural specifications and [scripts/setup.sh](scripts/setup.sh) for environment bootstrapping.
