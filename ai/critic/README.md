# AI Module: Critic

## Purpose
Filters false positives and validates security analysis before human reporting.

## Key Components
- `critic_agent.py`: Critic Agent: Evaluates security findings, filters false positives, and verifies patch viability.
- `validator.py`: Verification engine checking generated findings against known false-positive rules.
