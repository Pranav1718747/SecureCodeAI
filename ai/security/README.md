# AI Module: Security

## Purpose
Specialized agent for SAST, SCA, secret detection, and AST code parsing.

## Key Components
- `security_agent.py`: Primary Security Agent coordinator for running static and dynamic vulnerability analysis.
- `owasp_detector.py`: OWASP Top 10 & CWE vulnerability detector utilizing rule-based and LLM heuristics.
- `dependency_checker.py`: Software Composition Analysis (SCA) scanner for vulnerable third-party dependencies.
- `secret_detector.py`: Static analysis engine for detecting hardcoded API keys, tokens, and credentials.
- `parser.py`: Source code AST parser and code structure extractor for contextual AI analysis.
- `schemas.py`: Pydantic schemas for vulnerability findings, severity levels, and code locations.
