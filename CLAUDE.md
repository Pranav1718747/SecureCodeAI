# SecureCode AI — Complete Project Context for Claude

> **Purpose**: Single-file project context enabling an AI assistant to understand and contribute to every layer of the SecureCode AI platform without needing to read 25+ separate documents.
>
> **Source**: Synthesized from `docs/DOCUMENTATION_MASTER_PLAN.md` (147KB governing spec), existing source code, and actual implementation patterns.

---

## 1. What Is SecureCode AI

Enterprise-grade autonomous AI Security Engineer platform. Ingests source code repositories, identifies vulnerabilities across OWASP Top 10 and CWE taxonomies, explains each vulnerability in human-readable language, generates verified secure patches, and delivers Git-ready pull requests — all without human intervention.

**Core Loop**: Ingest → Plan → Analyse → Fix → Verify → Deliver

**Closed-Loop Learning**: Engineer feedback on patches → JSONL dataset generation → SageMaker PEFT/QLoRA fine-tuning → champion/challenger model evaluation → staged promotion.

### Business Context

- **Market**: Application Security Testing (AST) — intersection of SAST and AI-assisted remediation
- **Differentiator**: Incumbent tools (Snyk, SonarQube, Checkmarx) identify problems. SecureCode AI identifies AND fixes them with verified patches.
- **Revenue Model**: Enterprise SaaS per-repo/month. Tiers: Starter (1–5 repos), Professional (6–25), Enterprise (26+)
- **Compliance Targets**: SOC 2 Type II, GDPR, ISO 27001, OWASP ASVS Level 2
- **Timeline**: MVP Demo Q3 2026, Private Beta Q4 2026, Public Launch Q1 2027

### Product Vision (3 Phases)

| Phase | Timeframe | Capability |
|-------|-----------|------------|
| **Phase 1 — Detect & Fix** | 2026 | SAST scanning, vulnerability explanation, patch generation, verification, PR creation for Python |
| **Phase 2 — Learn & Improve** | 2027 | Feedback loop, JSONL datasets, SageMaker fine-tuning, automated evaluation, champion/challenger |
| **Phase 3 — Scale & Extend** | 2028 | Multi-language (JS, Go, Java, Rust), IDE integration, GitHub App marketplace, SOC 2 cert |

---

## 2. Core Principles (Ordered by Priority)

When two options conflict, higher-numbered principle yields to lower:

1. **Security First** — Every API endpoint requires auth. Secrets in AWS Secrets Manager. AES-256 at rest. TLS 1.3 in transit.
2. **Correctness Over Speed** — Every patch passes Bandit, Semgrep, syntax check, and Pytest BEFORE being surfaced.
3. **Explainability** — Agent outputs include structured reasoning chains. Critic validates explanations.
4. **Closed-Loop Learning** — Feedback stored, structured, fed into fine-tuning pipeline.
5. **Modularity** — Agents communicate via typed Pydantic state objects. Backend via Django signals + Celery tasks. Frontend via REST API only.
6. **Observability** — Every agent invocation emits structured logs via `structlog`. Every API call emits latency/status to CloudWatch.
7. **Cost Awareness** — Token budgets per agent. S3 lifecycle policies. ECS auto-scaling with cost ceilings.

---

## 3. System Architecture

### 3.1 Four-Layer Architecture

```
┌──────────────────────────────────────┐
│   Layer 4: Frontend (React/TS/Vite)  │  ← REST API only to Layer 3
├──────────────────────────────────────┤
│   Layer 3: Backend (Django/DRF)      │  ← Python imports to Layer 2
├──────────────────────────────────────┤
│   Layer 2: AI Core (LangGraph)       │  ← boto3 SDK to Layer 1
├──────────────────────────────────────┤
│   Layer 1: Infrastructure (AWS)      │  ← Managed services
└──────────────────────────────────────┘
```

No layer may directly depend on a layer more than one level away.

### 3.2 Communication Boundaries

| From → To | Allowed | Prohibited |
|-----------|---------|------------|
| Frontend → Backend | REST API over HTTPS | Direct DB access, direct AI imports |
| Backend → AI Core | Python function calls, Celery task dispatch | Direct AWS SDK calls for AI services |
| AI Core → AWS | boto3 SDK, LangChain integrations | Direct HTTP to AWS endpoints |
| Backend → Database | Django ORM | Raw SQL (except migrations + annotated perf queries) |
| Backend → Redis | django-redis cache, Celery broker | Scattered direct redis-py calls |

### 3.3 Data Flow Patterns

1. **Synchronous**: Frontend → Backend API → AI Core → Backend API → Frontend
2. **Asynchronous**: Frontend → Backend (returns task ID) → Celery Worker → AI Core → Result → Backend (persist) → Frontend (poll/WebSocket)
3. **Batch**: EventBridge Schedule → Celery Beat → Training Pipeline → SageMaker → Model Registry → Evaluation → Promotion

---

## 4. Technology Stack

| Layer | Technology | Version Constraint |
|-------|-----------|-------------------|
| Backend Framework | Django | `>=4.2.0, <5.0.0` |
| REST API | Django REST Framework | `>=3.14.0` |
| API Schema | drf-spectacular | `>=0.26.2` |
| Database | PostgreSQL | 15+ |
| Cache / Broker | Redis | `>=4.6.0` |
| Task Queue | Celery | `>=5.3.1` |
| Frontend Framework | React | 18+ |
| Frontend Language | TypeScript | 5+ |
| Build Tool | Vite | Latest |
| CSS | Tailwind CSS | 3+ |
| State Management | Redux Toolkit | Latest |
| UI Components | ShadCN UI | Latest |
| Agent Framework | LangGraph | `>=0.0.15` |
| LLM Orchestration | LangChain | `>=0.1.0` |
| Foundation Models | Amazon Bedrock | (managed) |
| Fine-Tuning | PEFT + QLoRA | PEFT `>=0.6.0` |
| Model Hosting | Amazon SageMaker | (managed) |
| SAST — Python | Bandit | `>=1.7.5` |
| SAST — Multi-lang | Semgrep | `>=1.45.0` |
| Test Framework | Pytest | `>=7.4.0` |
| Structured Logging | structlog | `>=23.1.0` |
| Data Validation | Pydantic | `>=2.4.0` |
| WSGI Server | Gunicorn | `>=21.2.0` |
| Containerisation | Docker + Docker Compose | Latest |
| Container Orchestration | Amazon ECS (Fargate) | (managed) |


### Prohibited Dependencies

| Banned | Reason | Use Instead |
|--------|--------|-------------|
| Flask | Django is chosen backend | Django |
| OpenAI SDK | Bedrock is chosen LLM | boto3 + LangChain |
| MongoDB | PostgreSQL is chosen DB | PostgreSQL |
| SQLAlchemy | Django ORM is chosen | Django ORM |
| Material UI | ShadCN UI is chosen | ShadCN UI |

---

## 5. Repository Structure

```
SecureCode-AI/
├── ai/                         # AI Core — multi-agent engine
│   ├── agents/                 # Base agent class, orchestrator, state, edges
│   │   ├── base.py             # BaseAgent ABC — Bedrock invoke + retry + Pydantic parse
│   │   ├── orchestrator.py     # ScanOrchestrator — LangGraph StateGraph builder
│   │   ├── state.py            # WorkflowState, AgentError, WorkflowMetadata (Pydantic)
│   │   ├── edges.py            # Conditional edge functions (should_retry_security)
│   │   └── errors.py           # Agent error types
│   ├── planner/                # Planner Agent — repo analysis, file batching, scan plan
│   ├── security/               # Security Agent — OWASP/CWE detection, confidence scoring
│   ├── critic/                 # Critic Agent — finding validation, quality scoring
│   ├── knowledge/              # Knowledge Agent — OWASP/CWE RAG retrieval, context injection
│   ├── patches/                # AutoFix Agent — patch generation, Git diff, patch application
│   │   ├── patch_generator.py  # Patch generation logic
│   │   ├── patch_applier.py    # Patch application
│   │   └── git_diff.py         # Git diff utilities
│   ├── verification/           # Verification Agent — Bandit/Semgrep/Pytest sandbox runner
│   ├── training/               # Fine-tuning pipeline — JSONL generation, SageMaker jobs
│   ├── evaluation/             # Model evaluation — benchmark suite, champion/challenger
│   ├── prompts/                # Prompt template library (versioned Python string constants)
│   ├── memory/                 # Agent memory — short-term + long-term state managers
│   └── utils/                  # Shared AI utilities
├── backend/                    # Django REST Framework application
│   ├── accounts/               # User management, JWT auth, RBAC (admin/engineer/viewer)
│   ├── api/                    # API routing, viewsets, schema definitions
│   ├── common/                 # Shared utilities, BaseModel (UUID pk, created_at, updated_at)
│   ├── config/                 # Django settings, WSGI/ASGI, Celery config
│   ├── repositories/           # Repository ingestion, cloning, management
│   ├── reviews/                # Vulnerability findings, audit trails, feedback
│   ├── patches/                # Patch management models/views
│   ├── verification/           # Verification run records and reports
│   ├── evaluation/             # Model evaluation dataset/run tracking
│   ├── training/               # Training job management
│   └── monitoring/             # Health check and observability endpoints
├── frontend/                   # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── store/              # Redux Toolkit state management
│   │   ├── services/           # API client (Axios + JWT interceptors)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── contexts/           # React context providers
│   │   ├── layouts/            # Page layout wrappers
│   │   ├── routes/             # React Router configuration
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   ├── styles/             # Global CSS + Tailwind config
│   │   ├── animations/         # Animation definitions
│   │   ├── constants/          # Application constants
│   │   └── assets/             # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
├── docker/
│   ├── docker-compose.yml      # postgres:15, redis:7, backend, celery_worker, frontend
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.Dockerfile
├── nginx/                      # Reverse proxy configuration
├── scripts/
│   ├── setup.sh                # Env bootstrap (venv, pip, npm install)
│   ├── run.sh                  # Start services
│   ├── deploy.sh               # Deployment script
│   └── seed_db.py              # Database seeding
├── tests/
│   └── ai/                     # Pytest tests for AI agents
├── docs/                       # 25-document documentation suite
│   └── DOCUMENTATION_MASTER_PLAN.md  # 3300-line governing spec
├── .github/workflows/          # CI/CD GitHub Actions
├── requirements.txt            # Python dependencies
├── package.json                # Root monorepo task runner
├── .env.example                # All env vars with placeholders
└── .env                        # Local dev secrets (gitignored)
```

---

## 6. AI Agent Architecture (LangGraph Multi-Agent Workflow)

### 6.1 Agent Catalog

Six specialized agents orchestrated as a directed graph:

| Agent | LangGraph Node | Responsibility | Model | Max Input Tokens | Max Output Tokens |
|-------|---------------|----------------|-------|-----------------|-------------------|
| **Planner** | `plan_scan` | Repo analysis, file classification, risk prioritisation, batch construction | Claude 3.5 Sonnet | 8,000 | 4,000 |
| **Security** | `analyse_security` | Vulnerability detection (OWASP Top 10, CWE), secret detection, dependency analysis | Claude 3.5 Sonnet | 100,000 | 8,000 |
| **Knowledge** | `retrieve_knowledge` | OWASP/CWE context retrieval via vector store, context injection into prompts | Claude 3 Haiku | 32,000 | 4,000 |
| **Critic** | `validate_findings` | Finding validation, explanation quality scoring, patch pre-validation, rejection routing | Claude 3 Haiku | 16,000 | 4,000 |
| **AutoFix** | `generate_patches` | Patch generation, minimal diff strategy, Git integration via GitPython | Claude 3.5 Sonnet | 100,000 | 16,000 |
| **Verification** | `verify_patches` | Multi-tool sandbox verification (Bandit → Semgrep → Pytest), pass/fail aggregation | Claude 3 Haiku | 16,000 | 4,000 |

### 6.2 LangGraph Workflow Graph

```
START
  │
  ▼
plan_scan (Planner)
  │
  ▼
analyse_security (Security)
  │
  ▼
retrieve_knowledge (Knowledge)
  │
  ▼
validate_findings (Critic)
  │
  ├─ [rejected + retries < 2] ──→ analyse_security (loop back)
  │
  └─ [accepted OR retries >= 2 OR errors] ──→ END
```

**Current Implementation** (`ai/agents/orchestrator.py`):
- `ScanOrchestrator` builds and compiles a `StateGraph(WorkflowState)`
- Nodes added: `plan_scan`, `analyse_security`, `retrieve_knowledge`, `validate_findings`
- Conditional edge `should_retry_security` routes from `validate_findings` back to `analyse_security` or to `END`
- AutoFix and Verification agents are defined but not yet wired into the graph (Phase 1 expansion)

### 6.3 Global Workflow State (`ai/agents/state.py`)

```python
class WorkflowState(BaseModel):
    repository_id: UUID
    repository_url: str = ""
    branch: str = "main"
    file_tree: list[str] = []
    scan_plan: Optional[Any] = None
    findings: list[Any] = []
    knowledge_context: list[Any] = []
    patches: list[Any] = []
    verifications: list[Any] = []
    errors: list[AgentError] = []
    security_retry_count: int = 0
    metadata: WorkflowMetadata  # request_id, started_at, model_version, total_tokens_used
```

### 6.4 BaseAgent Pattern (`ai/agents/base.py`)

All agents extend `BaseAgent` (ABC):
- **Constructor**: `model_id`, `temperature` (0.0 default), `region_name` (us-east-1), `max_tokens`
- **`invoke(prompt, response_schema, max_retries=3, backoff_factor=2.0)`**: Calls Bedrock `invoke_model`, parses JSON (handles ```json fences), validates into Pydantic schema, exponential backoff on failure
- **`run(state) -> dict[str, Any]`**: Abstract method — each agent implements its LangGraph node logic
- Lazy-loaded `boto3.client("bedrock-runtime")` via `@property client`

### 6.5 Agent Design Constraints

1. **Single Responsibility**: Each agent performs exactly one category of reasoning
2. **Typed State**: Pydantic-validated state objects. No raw dicts for inter-agent communication
3. **Deterministic Routing**: Conditional edges defined as explicit functions, not agent decisions
4. **Token Budget**: Per-agent max tokens enforced in config, not hardcoded
5. **Timeout**: Enforced by LangGraph orchestrator, not by agent itself
6. **Idempotency**: Same state + model + temperature=0 → same output
7. **Structured Output**: All LLM responses parsed into Pydantic schemas via `_parse_response`

### 6.6 Prompt Template Structure

Every prompt template uses this structure (stored in `ai/prompts/`):

```
<system>{role and behavioral boundaries}</system>
<context>{runtime data — source code, scan results, OWASP data}</context>
<task>{specific action to perform}</task>
<constraints>{what NOT to do, quality thresholds}</constraints>
<output_format>{exact JSON schema for response}</output_format>
<examples>{few-shot examples — required for Planner, Security, AutoFix}</examples>
```

Rules:
- Must instruct model to output valid JSON matching Pydantic schema
- Must include negative examples ("Do NOT generate patches that…")
- Must specify vulnerability taxonomy (OWASP Top 10, CWE)
- Must include confidence score requirement
- Must NOT include instructions to apologize or hedge

---

## 7. Database Schema

PostgreSQL 15+. All models inherit `BaseModel` (UUID `id`, `created_at`, `updated_at`).

### Core Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `users` | User accounts, auth | → organisations |
| `organisations` | Multi-tenant org grouping | ← users, ← repositories |
| `repositories` | Tracked code repos | → organisations; ← scans |
| `scans` | Security scan runs | → repositories; ← scan_results |
| `scan_results` (findings) | Individual vulnerability findings | → scans |
| `patches` | Generated security patches | → scan_results |
| `verifications` | Patch verification runs | → patches |
| `pull_requests` | Created GitHub PRs | → patches |
| `feedback` | Engineer feedback on patches | → patches |
| `training_datasets` | JSONL training data files | ← feedback |
| `training_jobs` | SageMaker fine-tuning runs | → training_datasets |
| `model_versions` | Model registry entries | ← training_jobs |
| `evaluation_runs` | Benchmark evaluation runs | → model_versions |
| `evaluation_results` | Per-test-case eval results | → evaluation_runs |
| `audit_log` | All system actions for compliance | (standalone) |

### Naming Conventions

- Tables: `lower_snake_case`, plural (`scan_results`)
- Columns: `lower_snake_case` (`created_at`)
- Primary keys: `id` (UUID)
- Foreign keys: `{referenced_table_singular}_id` (`repository_id`)
- Indexes: `idx_{table}_{column}`
- Constraints: `chk_{table}_{rule}`
- Enums: `UPPER_SNAKE_CASE` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)

---

## 8. REST API

### Base URL & Auth

- Base: `/api/v1/`
- Auth: JWT Bearer tokens (RS256, rotating keys from Secrets Manager)
- Access token: 15-minute expiry. Refresh token: 7-day expiry with rotation.
- All endpoints require auth except `/api/v1/auth/login/` and `/api/v1/auth/register/`
- RBAC: `admin`, `engineer`, `viewer`

### Endpoint Categories

| Category | Base Path | Key Operations |
|----------|-----------|----------------|
| Authentication | `/api/v1/auth/` | login, register, refresh, logout |
| Repositories | `/api/v1/repositories/` | CRUD, clone trigger |
| Scans | `/api/v1/scans/` | Initiate scan (async), get results |
| Findings | `/api/v1/findings/` | List/filter vulnerabilities |
| Patches | `/api/v1/patches/` | View generated patches |
| Verifications | `/api/v1/verifications/` | Verification run results |
| Pull Requests | `/api/v1/pull-requests/` | PR status and management |
| Feedback | `/api/v1/feedback/` | Engineer patch feedback |
| Training | `/api/v1/training/` | Training job management |
| Evaluations | `/api/v1/evaluations/` | Model evaluation results |
| Dashboard | `/api/v1/dashboard/` | Aggregated analytics |
| Users | `/api/v1/users/` | User management |

### API Conventions

- URL paths: `lower-kebab-case`, plural nouns (`/api/v1/scan-results/`)
- Query params: `lower_snake_case` (`?severity=high&page_size=20`)
- Request/response body: `lower_snake_case` JSON
- Custom headers: `X-SecureCode-{Name}`
- Error envelope: `{ "error_code": str, "message": str, "details": dict, "request_id": str }`
- Pagination: cursor-based or offset/limit

---

## 9. Environment Variables

```bash
# General
ENVIRONMENT=development          # development | staging | production
DEBUG=True
SECRET_KEY=<django-secret>
ALLOWED_HOSTS=localhost,127.0.0.1

# Django
DJANGO_PORT=8000
CORS_ALLOWED_ORIGINS=http://localhost:3000

# PostgreSQL
POSTGRES_DB=securecodeai_db
POSTGRES_USER=securecodeai_admin
POSTGRES_PASSWORD=<password>
POSTGRES_HOST=postgres           # 'postgres' in Docker, 'localhost' bare-metal
POSTGRES_PORT=5432

# Redis & Celery
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# AWS & AI
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
AWS_SAGEMAKER_ENDPOINT=securecodeai-qlora-endpoint
HUGGINGFACE_API_TOKEN=hf_<token>
S3_BUCKET_NAME=securecodeai-artifacts-bucket

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_MOCK_DATA=false
```

Variable naming: `DJANGO_*` for Django, `DB_*` or `POSTGRES_*` for database, `REDIS_*` for Redis, `AWS_*` for AWS, `SCAI_*` for app-specific.

---

## 10. Development Commands

### Initial Setup
```bash
bash scripts/setup.sh        # Creates venv, installs Python + Node deps
# OR
npm run setup
```

### Running Locally
```bash
source venv/bin/activate

# Backend (Django)
cd backend && python manage.py runserver

# Celery Worker
cd backend && celery -A config worker -l info

# Frontend (Vite dev server)
npm run frontend:dev
# or: cd frontend && npm run dev

# Full Stack via Docker
npm run docker:up              # docker-compose -f docker/docker-compose.yml up --build
npm run docker:down
```

### Docker Compose Services
- `postgres` (postgres:15-alpine) — port 5432
- `redis` (redis:7-alpine) — port 6379
- `backend` — port 8000, mounts `backend/` and `ai/`
- `celery_worker` — same image as backend, runs Celery
- `frontend` — port 3000

### Testing
```bash
# AI Core + Backend
pytest
pytest tests/ai/test_base_agent.py
pytest backend/ --cov

# AI agent tests with mocked Bedrock
pytest ai/ --cov

# Frontend
npm run test:frontend          # Vitest + React Testing Library

# Security scanning
bandit -r backend/ ai/
semgrep --config auto .

# E2E
npx playwright test
```

### Coverage Requirements

| Layer | Line Coverage | Branch Coverage |
|-------|--------------|----------------|
| Backend | 80% | 70% |
| Frontend | 75% | 65% |
| AI agents | 85% (excluding prompts) | 75% |
| API endpoints | 90% | 80% |

---

## 11. Coding Standards

### Python (3.11+)

- **Formatter/Linter**: `black` (line 88), `flake8`, `isort`
- **Type annotations**: MANDATORY on all public function params and returns
- **Docstrings**: Google-style on all public classes/methods/functions
- **Logging**: `structlog` exclusively. Never `print()`.
- **Exception handling**: Catch specific exceptions. Never bare `except:`.
- **Naming**: `lower_snake_case` variables/methods/modules, `PascalCase` classes, `UPPER_SNAKE_CASE` constants

### TypeScript / React

- **TypeScript 5+**, `prettier` + `eslint` with `@typescript-eslint`
- **Functional components** with React 18 hooks only. No class components.
- **State**: Redux Toolkit for global state. `useState` for local UI state.
- **API calls**: Centralized through `frontend/src/services/apiClient.ts` (Axios + JWT interceptors)
- **Naming**: `PascalCase` for components/files (`DashboardPage.tsx`), `camelCase` for hooks/functions (`useScanPolling.ts`)

### Django

- All domain models inherit `BaseModel` (UUID `id`, `created_at`, `updated_at`)
- DRF viewsets with explicit `permission_classes` (never rely on defaults alone)
- API schema documented with drf-spectacular

### Agent Code

- Agent classes: `{Name}Agent` (`PlannerAgent`, `SecurityAgent`)
- State classes: `{Name}State` (`PlannerState`)
- Workflow functions: `{verb}_{noun}` (`create_scan_plan`)
- LangGraph nodes: `lower_snake_case` (`plan_scan`, `analyse_security`)
- Prompt templates: `{agent}_{purpose}.py` in `ai/prompts/`

### Git & Commits

- Branching: `{type}/{ticket-id}/{short-description}` (e.g., `feature/SCAI-42/planner-agent-workflow`)
- Commits: Conventional Commits (`feat(ai): add planner agent workflow`)
- Scopes: `backend`, `frontend`, `ai`, `infra`, `docs`, `agents`, `training`, `evaluation`
- Protected branches: `main` (1 approval + CI), `staging` (CI), `develop` (open)

---

## 12. Security Requirements

### Authentication & Authorization
- JWT RS256 with rotating keys from AWS Secrets Manager
- Access tokens: 15 min. Refresh tokens: 7 days (with rotation).
- RBAC: `admin`, `engineer`, `viewer`
- Object-level permissions: users see only repos owned by their org

### Data Protection
- At rest: AES-256 (SSE-S3 for S3, RDS encryption for PostgreSQL)
- In transit: TLS 1.3 everywhere (HTTPS, DB connections, Redis)
- Source code stored in S3 with 90-day retention, then auto-deleted
- No secrets on disk in prod — all from AWS Secrets Manager
- `.env` for local dev only (gitignored). `.env.example` committed with placeholders.

### OWASP ASVS Level 2 Controls
- MFA optional for users, enforced for admins
- httpOnly + Secure + SameSite=Strict cookies for refresh tokens
- DRF serializer validation + Pydantic for AI inputs
- HSTS headers, HTTP → HTTPS redirect
- No default credentials anywhere

---

## 13. AWS Infrastructure

- **Primary Region**: `us-east-1` (broadest Bedrock model availability)
- **DR Region**: `us-west-2` (S3 cross-region replication only)
- **Resource Naming**: `scai-{environment}-{service}-{purpose}` (e.g., `scai-prod-ecs-backend`)
- **Required Tags**: `Project`, `Environment`, `Owner`, `CostCenter`, `ManagedBy`, `DataClassification`
- **IAM**: Least privilege. No IAM user access keys. ECS task roles + SageMaker execution roles only. No wildcard (`*`) resources in prod.

### Services Used
- **ECS Fargate**: Backend + Celery workers
- **RDS PostgreSQL 15**: Primary database
- **ElastiCache Redis**: Caching + Celery broker
- **S3**: Training data, model artifacts, scanned source code
- **Bedrock**: Foundation model inference (Claude 3.5 Sonnet, Claude 3 Haiku)
- **SageMaker**: Fine-tuning jobs + model endpoints
- **Secrets Manager**: All production secrets
- **EventBridge**: Training pipeline scheduling
- **CloudWatch**: Logs, metrics, alarms

---

## 14. Training & Evaluation Pipeline

### Fine-Tuning Pipeline
1. Engineer feedback collected on patches (1–5 score + optional comments)
2. Feedback → JSONL training records: `{"instruction": "...", "input": "...", "output": "...", "vulnerability_type": "CWE-89", "severity": "CRITICAL", "language": "python", "feedback_score": 5}`
3. JSONL uploaded to S3, train/val/test split
4. SageMaker training job with PEFT/QLoRA on base model (Mistral 7B or CodeLlama)
5. Trained model registered in model registry with version + metrics
6. Triggered by EventBridge schedule

### Model Evaluation
- Benchmark suite covering all OWASP Top 10 categories (never enters training set)
- Metrics: Detection (Precision, Recall, F1), Patch Quality (compilation rate, test pass rate, minimal diff ratio), Cost (tokens/scan, latency)
- Champion/Challenger: Challenger must exceed Champion F1 by ≥2%, patch compilation ≥95%, latency increase ≤10%
- Staged rollout with canary deployment and feature flags
- Rollback procedure documented

---

## 15. Performance Targets

### API Latency
| Category | P50 | P99 |
|----------|-----|-----|
| GET endpoints | <100ms | <500ms |
| POST/PUT endpoints | <200ms | <1s |
| Scan initiation | <500ms | <2s |
| Scan completion | <5min | <15min |

### Agent Latency
| Agent | P50 | P99 |
|-------|-----|-----|
| Planner | <5s | <15s |
| Security | <30s | <90s |
| Critic | <10s | <30s |
| Knowledge | <5s | <15s |
| AutoFix | <30s | <90s |
| Verification | <60s | <180s |

### Resource Limits
- Max repository size: 500MB
- Max files per scan batch: 50
- Max patch size: 10,000 lines
- Concurrent scans per cluster: 10
- Max Celery workers: 8

---

## 16. Observability

- **Logging**: `structlog` structured JSON logs. Never raw `print()`.
- **Log levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Metrics**: Application (request latency, error rates), AI (token usage, model latency, cost per scan), Business (scans/day, patches generated)
- **Alerting**: CloudWatch alarms with severity levels + escalation policy
- **Health checks**: `/health/` and `/health/ready/` endpoints covering all dependencies

---

## 17. Team & Ownership

| Role | ID | Owned Directories |
|------|----|-------------------|
| Backend Engineer | BE-1 | `backend/` |
| Frontend Engineer | FE-1 | `frontend/` |
| AI Engineer 1 | AI-1 | `ai/planner/`, `ai/security/`, `ai/critic/`, `ai/knowledge/`, `ai/prompts/`, `ai/memory/`, `ai/agents/` |
| AI Engineer 2 | AI-2 | `ai/patches/`, `ai/verification/`, `ai/training/`, `ai/evaluation/`, `ai/utils/` |

---

## 18. Documentation Suite

25 documents in `docs/` numbered 00–24, organized by reading order:

- **00–02**: Business context (WHY) — Executive Summary, PRD, Business Analysis
- **03–05**: System structure (WHAT) — System Architecture, Database Design, API Spec
- **06–14**: AI internals (HOW — intelligence) — AI Architecture, 6 Agent docs, Training Pipeline, Model Evaluation
- **15–18**: Platform internals (HOW — infrastructure) — AWS, Security & Compliance, Frontend, Backend Architecture
- **19–21**: Operations (HOW — deployment) — Deployment Guide, Testing Strategy, Observability
- **22–24**: Future and external (WHERE NEXT) — Product Roadmap, Demo Script, Investor Pitch

Governing document: `docs/DOCUMENTATION_MASTER_PLAN.md` (SCAI-DMP-001)

---

## 19. Key Implementation Files Reference

| File | Purpose |
|------|---------|
| `ai/agents/base.py` | BaseAgent ABC — Bedrock invoke, retry, Pydantic parsing |
| `ai/agents/orchestrator.py` | ScanOrchestrator — LangGraph graph builder |
| `ai/agents/state.py` | WorkflowState global Pydantic model |
| `ai/agents/edges.py` | Conditional edge functions |
| `ai/planner/agent.py` | PlannerAgent implementation |
| `ai/security/agent.py` | SecurityAgent implementation |
| `ai/knowledge/agent.py` | KnowledgeAgent implementation |
| `ai/critic/agent.py` | CriticAgent implementation |
| `ai/patches/patch_generator.py` | Patch generation logic |
| `backend/config/` | Django settings, WSGI/ASGI, Celery config |
| `backend/common/` | BaseModel, shared utilities |
| `frontend/src/services/apiClient.ts` | Centralized API client (Axios + JWT) |
| `frontend/src/store/` | Redux Toolkit state slices |
| `docker/docker-compose.yml` | Full stack: postgres, redis, backend, celery, frontend |
| `.env.example` | All required environment variables |
| `scripts/setup.sh` | Environment bootstrap |
