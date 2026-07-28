# AI Module: Evaluation

## Purpose
Benchmark execution and comparative metric evaluation for fine-tuned security LLMs.

## Key Components
- `benchmark.py`: Executes automated security benchmarks (e.g., CyberSecEval) against fine-tuned models.
- `metrics.py`: Calculates security evaluation metrics: Pass@k code fix rate, precision, recall.
- `compare_models.py`: Comparative analysis engine comparing candidate fine-tuned models against base models.
- `leaderboard.py`: Generates benchmark summary leaderboards for model registry evaluation.
