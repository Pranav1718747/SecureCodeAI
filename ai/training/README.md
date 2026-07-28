# AI Module: Training

## Purpose
Synthetic dataset generation and PEFT/QLoRA LLM fine-tuning pipelines.

## Key Components
- `dataset_generator.py`: Synthetic vulnerability dataset creator generating vulnerable and secure code pairs.
- `jsonl_generator.py`: Prepares and formats raw code samples into JSONL files for QLoRA fine-tuning.
- `trainer.py`: PEFT/QLoRA model fine-tuning orchestration using HuggingFace and PyTorch.
- `model_registry.py`: Manages fine-tuned model artifacts, S3 storage, and SageMaker endpoint deployments.
