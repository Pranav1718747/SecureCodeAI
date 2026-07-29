# SecureCode AI — Engineering Standard Operating Procedures

> **Document Identifier:** `SCAI-SOP-001`  
> **Version:** `1.0.0`  
> **Status:** `ACTIVE`  
> **Classification:** `INTERNAL — ENGINEERING OPERATIONS`  
> **Author:** VP of Engineering & Principal Engineering Management  
> **Dependencies:** `SCAI-DMP-001`, `SCAI-IMP-001`, `SCAI-ETB-001`, `SCAI-SEP-001`, `SCAI-FIG-001`  

---

## Table of Contents

1. [Engineering Philosophy & Principles](#1-engineering-philosophy--principles)
2. [Coding & Design Standards](#2-coding--design-standards)
   - [Python Coding Standards](#python-coding-standards)
   - [TypeScript & React Coding Standards](#typescript--react-coding-standards)
   - [Django Framework Standards](#django-framework-standards)
   - [LangGraph & AI Agent Standards](#langgraph--ai-agent-standards)
   - [Prompt Engineering Standards](#prompt-engineering-standards)
3. [API & Database Standards](#3-api--database-standards)
   - [REST API Standards](#rest-api-standards)
   - [Database & Migration Standards](#database--migration-standards)
4. [Git & Source Control Protocol](#4-git--source-control-protocol)
5. [Code Review Protocol & Checklists](#5-code-review-protocol--checklists)
6. [Testing & Quality Assurance Standards](#6-testing--quality-assurance-standards)
7. [CI/CD & DevSecOps Standards](#7-cicd--devsecops-standards)
8. [Security Operations & Infrastructure Protocols](#8-security-operations--infrastructure-protocols)
9. [Operational Communication Cadence](#9-operational-communication-cadence)
10. [Quality Gates & Production Readiness](#10-quality-gates--production-readiness)
11. [Appendices](#11-appendices)
    - [Glossary](#glossary)
    - [Folder Ownership Matrix](#folder-ownership-matrix)
    - [Tooling & IDE Extensions](#tooling--ide-extensions)

---

## 1. Engineering Philosophy & Principles

SecureCode AI operates under a culture of engineering excellence, security-first architecture, and operational rigor.

### 1.1 Core Principles
1. **Security First**: Security is not an afterthought; it is built into every layer of code, API design, and cloud infrastructure.
2. **Deterministic & Provable AI**: Autonomous AI agents MUST be constrained by deterministic validation pipelines (Bandit, Semgrep, AST, Pytest) before proposing changes.
3. **Surgical Code Edits**: Edit only what is necessary. Preserve existing APIs, docstrings, formatting, and invariants.
4. **Zero Fluff & Caveman Technical Precision**: Communication, code reviews, and issue tracking MUST be concise, technically exact, and fluff-free.
5. **Fail-Safe & Observable by Default**: Every component must fail gracefully, emit structured JSON logs (`structlog`), and expose health telemetry.

---

## 2. Coding & Design Standards

### Python Coding Standards
- **Python Version:** Python 3.11+.
- **Formatter & Linter:** `black` (line length 88), `flake8`, `isort`.
- **Type Annotations:** MANDATORY on all public function parameters and return types. Checked via `mypy` / `django-stubs`.
- **Docstrings:** Google-style docstrings required on all public classes, methods, and functions.
- **Naming Conventions:** `lower_snake_case` for variables, methods, modules; `PascalCase` for classes; `UPPER_SNAKE_CASE` for constants.
- **Exception Handling:** Never use bare `except:`. Always catch specific exceptions and log tracebacks via `structlog`.

```python
import structlog
from typing import Optional

logger = structlog.get_logger()

def process_repository(repo_id: str, branch: Optional[str] = "main") -> bool:
    """Clones and processes a target repository.

    Args:
        repo_id: Unique UUID string of the repository.
        branch: Git branch to clone. Defaults to 'main'.

    Returns:
        bool: True if cloning succeeded, False otherwise.
    """
    logger.info("process_repository.started", repo_id=repo_id, branch=branch)
    try:
        # Implementation
        return True
    except KeyError as e:
        logger.error("process_repository.failed", repo_id=repo_id, error=str(e))
        raise
```

---

### TypeScript & React Coding Standards
- **TypeScript Version:** TypeScript 5.0+.
- **Formatter & Linter:** `prettier`, `eslint` with `@typescript-eslint`.
- **Components:** Functional components using React 18 hooks exclusively. Class components are strictly prohibited.
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`) for global application state; local `useState` for transient UI state.
- **API Calls:** Centralized through `frontend/src/services/apiClient.ts` using Axios with JWT interceptors.
- **Naming Conventions:** `PascalCase` for React components/files (`FindingsPage.tsx`); `camelCase` for hooks (`useScanPolling.ts`), functions, and state variables.

---

### Django Framework Standards
- **Framework Version:** Django 4.2 LTS + Django REST Framework 3.14+.
- **Models:** Abstract base model `BaseModel` (`id` UUID pk, `created_at`, `updated_at`) MUST be inherited by all domain models.
- **Views:** DRF Generic Viewsets (`ModelViewSet`, `ReadOnlyModelViewSet`) preferred over raw function views.
- **Permissions:** Every DRF viewset MUST explicitly define `permission_classes` (e.g., `[IsAuthenticated, IsEngineer]`).
- **Database Access:** Avoid `N+1` queries; use `select_related()` and `prefetch_related()` explicitly on all list queries.

---

### LangGraph & AI Agent Standards
- **Orchestration:** Multi-agent workflows MUST be constructed using stateful LangGraph `StateGraph` directed graphs.
- **State Integrity:** Inter-agent communication state MUST be validated via Pydantic `WorkflowState` objects. Raw dictionaries are strictly prohibited.
- **Node Isolation:** Each agent (Planner, Security, Critic, Knowledge, AutoFix, Verification) executes inside its own node function without direct coupling to other nodes.
- **Recursion Safety:** LangGraph execution MUST set `recursion_limit=10` to prevent runaway agent loops.

---

### Prompt Engineering Standards
- **Structure:** All system prompts MUST be version-controlled under `ai/prompts/` and formatted with standard XML tags (`<system>`, `<context>`, `<task>`, `<constraints>`, `<output_format>`).
- **Constraints:** AutoFix prompts MUST explicitly prohibit modifying test files, altering CI configurations, or deleting files.
- **Temperature:** Temperature = `0.0` for deterministic reasoning across all security analysis and patch generation tasks.

---

## 3. API & Database Standards

### REST API Standards
- **URL Naming:** Plural, lower-kebab-case nouns (e.g., `/api/v1/scan-results/`).
- **Versioning:** URL prefix versioning (`/api/v1/`).
- **Response Format:** Standardized JSON error and data envelope format.

```json
{
  "status": "error",
  "error_code": "RESOURCE_NOT_FOUND",
  "message": "The requested scan ID does not exist.",
  "request_id": "req-99a8b7c6-4321-4d3e-8f1a-0123456789ab"
}
```

---

### Database & Migration Standards
- **Engine:** PostgreSQL 15+.
- **Migrations:** Managed via Django `makemigrations`. Backward compatibility mandatory for all migrations.
- **Indexes:** Explicit B-Tree indexes mandatory on all foreign keys, status fields, and queried timestamps (`idx_{table}_{column}`).
- **Primary Keys:** UUID v4 primary keys (`id`) mandatory across all tables.

---

## 4. Git & Source Control Protocol

### Branching Strategy (Modified Git Flow)
- `main`: Protected production branch.
- `staging`: Pre-production validation branch.
- `develop`: Primary integration branch.
- Feature branches: `{type}/{ticket-id}/{short-description}` (e.g., `feature/SCAI-42/planner-agent`).

### Commit Message Convention (Conventional Commits)
```
<type>(<scope>): <short description>

[optional body]

[optional issue reference]
```
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `security`.
- **Example:** `feat(security): add CWE-89 SQL injection detection logic to SecurityAgent`

---

## 5. Code Review Protocol & Checklists

### Review Workflow
1. Every Pull Request MUST be assigned at least 1 primary engineer reviewer.
2. PR must pass all CI checks (Black, Flake8, ESLint, Bandit, Semgrep, Pytest) before review.
3. Merge requires explicit `Approved` status from reviewer. Squash & Merge enforced.

### Code Review Checklist
- [ ] **Architecture:** Code conforms to four-layer architectural separation.
- [ ] **Security:** Input sanitized, credentials retrieved from AWS Secrets Manager, zero raw SQL.
- [ ] **Performance:** DB queries use `select_related()`; no heavy synchronous tasks on main HTTP worker thread.
- [ ] **Readability:** Functions < 50 lines, files < 500 lines, explicit type hints.
- [ ] **Testing:** Unit tests added covering both happy path and failure edge cases (coverage >= target).

---

## 6. Testing & Quality Assurance Standards

### Test Pyramid & Coverage Requirements

| Test Level | Framework | Coverage Requirement | Scope |
|------------|-----------|----------------------|-------|
| **Unit Tests** | Pytest / Vitest | 80% Backend, 75% Frontend, 85% AI | Pure function logic, serializers, Redux reducers |
| **Integration Tests** | Pytest + Test DB | 80% API Views | DRF views, ORM queries, Celery tasks |
| **Agent Tests** | Pytest + Mock Bedrock | 85% Agent State Logic | LangGraph graph routing, prompt parsing |
| **E2E Tests** | Playwright | Core User Journeys | User Login → Repo Connect → Scan → Patch View |
| **SAST Security** | Bandit / Semgrep | 0 High/Critical Findings | Static code security audit |

---

## 7. CI/CD & DevSecOps Standards

### Automated Pipeline Stages (`.github/workflows/ci.yml`)
1. **Linting & Code Style:** `black --check`, `flake8`, `prettier --check`, `eslint`.
2. **Security Audit:** `bandit -r backend/ ai/`, `semgrep --config auto .`.
3. **Backend Test Suite:** `pytest backend/ ai/ --cov --cov-fail-under=80`.
4. **Frontend Test Suite:** `npm --prefix frontend run test` and `npm --prefix frontend run build`.

---

## 8. Security Operations & Infrastructure Protocols

### Secrets & Credentials Management
- **Local Dev:** Secret placeholders in `.env.example`. Real `.env` added to `.gitignore`.
- **Production:** Secrets injected at runtime from AWS Secrets Manager directly into ECS container tasks.
- **Rotation:** JWT signing keys rotated every 90 days. AWS Access Keys rotated every 60 days.

### Audit Logging
- Every security-sensitive action (User login, repo modification, scan initiation, patch creation) MUST create an immutable `AuditLog` entry.

---

## 9. Operational Communication Cadence

| Event | Schedule | Duration | Format & Objectives |
|-------|----------|----------|---------------------|
| **Daily Stand-up** | Mon–Fri 09:30 AM | 15 Mins | "Yesterday, Today, Blockers" (Task ID referenced) |
| **Sprint Planning** | Day 1 of Sprint | 1 Hour | Backlog refinement & commit task allocations |
| **Architecture Review** | Wednesdays 02:00 PM | 45 Mins | RFC review for major system architectural changes |
| **Sprint Retrospective** | Last Day of Sprint | 45 Mins | "What went well, what needs improvement, action items" |

---

## 10. Quality Gates & Production Readiness

### Definition of Ready (DoR)
A task is Ready for implementation when:
1. User story / technical description is fully written with clear acceptance criteria.
2. Dependencies are identified and merged.
3. Assigned to a single engineer with effort estimate (Complexity / Hours).

### Definition of Done (DoD)
A task is Done when:
1. Feature code is fully implemented according to coding standards.
2. Unit and integration tests pass with required coverage targets.
3. Peer code review approved and squash-merged into `develop`.
4. CI/CD pipeline builds successfully and deploys to staging environment.

---

## 11. Appendices

### Glossary
- **Agent:** Autonomous AI reasoning component within the LangGraph workflow.
- **AutoFix:** Automatic unified diff generation engine to remediate security vulnerabilities.
- **Champion Model:** Active baseline model serving production inference.
- **Challenger Model:** Newly fine-tuned model undergoing benchmark evaluation.
- **QLoRA:** Quantized Low-Rank Adaptation technique for memory-efficient LLM fine-tuning.

### Folder Ownership Matrix

| Folder | Primary Owner | Secondary Reviewer |
|--------|---------------|--------------------|
| `backend/` | Backend Engineer | CTO / Principal Architect |
| `frontend/` | Frontend Engineer | Backend Engineer |
| `ai/planner/`, `security/`, `critic/` | AI Engineer 1 | AI Engineer 2 |
| `ai/patches/`, `verification/`, `training/` | AI Engineer 2 | AI Engineer 1 |
| `docker/`, `.github/` | Backend Engineer | DevOps Lead |

---

## Change Log

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-07-29 | VP of Engineering | Initial release of Standard Operating Procedures |

---

## Referenced By

This document is the operational standard for all software engineers, QA leads, AI researchers, and DevOps architects within the SecureCode AI organization.
