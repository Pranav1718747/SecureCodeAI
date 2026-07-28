# AI Module: Utils

## Purpose
Shared AI utility functions, code sanitizers, and LLM client factories.

## Key Components
- `code_cleaner.py`: Sanitizes raw code snippets, removes markdown formatting, and validates AST.
- `llm_factory.py`: Unified factory for instantiating Amazon Bedrock, SageMaker, or HuggingFace LLM clients.
