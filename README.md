# SecureCodeAI - Production-Grade AI Security Engineer Platform

## Overview
SecureCodeAI is an enterprise-level, autonomous AI-powered Security Engineer platform designed to automate repository static analysis, vulnerability detection (OWASP Top 10, CWE, secret leaks, vulnerable dependencies), automated patch generation (autofix), and dynamic validation. The platform leverages high-speed LLM inference pipelines connected natively via Groq.

## System Architecture Overview
The system follows a modular microservice-ready monolith architecture cleanly separating four main layers:
- **Frontend (`frontend/`)**: React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, and ShadCN UI.
- **Backend (`backend/`)**: Django REST Framework, PostgreSQL, Redis, Django Channels (WebSockets), and Celery background worker queues.
- **AI Core (`ai/`)**: Autonomous multi-agent graph workflows using LangGraph and LangChain powered by **Groq** (`llama-3.3-70b-versatile`) for ultra-low latency reasoning. Includes Planner, Security, Knowledge, Critic, and Patch generation agents.
- **Infrastructure (`docker/`, `nginx/`, `scripts/`)**: Containerized deployment with Docker Compose and Nginx reverse proxy.

## Getting Started
### 1. Environment Configuration
Create a `.env` file in the root directory and add the following keys:
```env
# Get a free API key at https://console.groq.com/
GROQ_API_KEY=gsk_your_api_key_here

# Django Backend Configuration
DJANGO_SECRET_KEY=your_secure_django_secret_key
DEBUG=True

# Celery / Redis Integration
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

### 2. Infrastructure Setup
The easiest way to boot the database and Redis cache is via Docker:
```bash
docker-compose up -d
```

### 3. Backend & Celery
```bash
cd backend
pip install -r ../requirements.txt
python manage.py migrate
python manage.py runserver
```
Start the Celery worker in a separate terminal:
```bash
cd backend
celery -A config worker -l info
```

### 4. QA Veteran Regression Suite
This repository comes packed with an aggressive, veteran-level end-to-end regression suite covering API bruteforcing, Redis race condition hammering, WebSocket connection storms, and LLM Hallucination poisoning. 
Run the suite with:
```bash
bash scripts/run_qa_veteran_suite.sh
```

## Documentation
See [docs/architecture.md](docs/architecture.md) for full architectural specifications.
