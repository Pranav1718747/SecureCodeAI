# AI Module: Verification

## Purpose
Sandbox engine executing dynamic and static verification tools to validate fixes.

## Key Components
- `syntax_checker.py`: Validates syntax correctness of generated code patches using AST compilers.
- `bandit_runner.py`: Executes Bandit SAST scans to verify Python security patches.
- `semgrep_runner.py`: Runs Semgrep static analysis rules against patched code to ensure zero regression.
- `pytest_runner.py`: Triggers automated test suites (pytest) in sandbox to prevent functional regression.
