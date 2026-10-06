import os

files = {
    "ai/security/parser.py": "import ast\nclass ASTParser:\n    def parse(self, code): return ast.parse(code)\n",
    "ai/security/owasp_detector.py": "class OWASPDetector:\n    def detect(self): pass\n",
    "ai/security/secret_detector.py": "class SecretDetector:\n    def detect(self): pass\n",
    "ai/security/dependency_checker.py": "class DependencyChecker:\n    def check(self): pass\n",
    "ai/security/security_agent.py": "from ai.security.agent import SecurityAgent\n",
    "ai/patches/patch_generator.py": "class PatchGenerator:\n    def generate(self): pass\n",
    "ai/patches/patch_applier.py": "class PatchApplier:\n    def apply(self): pass\n",
    "ai/patches/git_diff.py": "class GitDiffParser:\n    def parse(self): pass\n",
    "ai/verification/bandit_runner.py": "class BanditRunner:\n    def run(self): pass\n",
    "ai/verification/semgrep_runner.py": "class SemgrepRunner:\n    def run(self): pass\n",
    "ai/verification/pytest_runner.py": "class PytestRunner:\n    def run(self): pass\n",
    "ai/verification/syntax_checker.py": "import ast\nclass SyntaxChecker:\n    def check(self, code): return ast.parse(code)\n",
    "ai/training/dataset_generator.py": "class DatasetGenerator:\n    def generate(self): pass\n",
    "ai/training/jsonl_generator.py": "class JSONLGenerator:\n    def generate(self): pass\n",
    "ai/training/trainer.py": "class SageMakerTrainer:\n    def train(self): pass\n",
    "ai/training/model_registry.py": "class ModelRegistry:\n    def register(self): pass\n",
    "ai/evaluation/benchmark.py": "class BenchmarkRunner:\n    def run(self): pass\n",
    "ai/evaluation/metrics.py": "class MetricsCalculator:\n    def calculate(self): pass\n",
    "ai/evaluation/leaderboard.py": "class Leaderboard:\n    def rank(self): pass\n",
    "ai/evaluation/compare_models.py": "class ModelComparator:\n    def compare(self): pass\n",
    "ai/utils/llm_factory.py": "class LLMFactory:\n    def create(self): pass\n",
    "ai/utils/code_cleaner.py": "class CodeCleaner:\n    def clean(self): pass\n",
    "ai/knowledge/vector_store.py": "class VectorStoreClient:\n    def search(self): pass\n",
    "ai/knowledge/embeddings.py": "class EmbeddingGenerator:\n    def generate(self): pass\n",
    "ai/prompts/patch_prompts.py": "PATCH_SYSTEM_PROMPT = 'Fix bugs.'\n",
    "ai/prompts/templates.py": "class PromptTemplate:\n    pass\n",
    "ai/critic/validator.py": "def validate_finding_rules(): pass\n",
    "ai/critic/critic_agent.py": "from ai.critic.agent import CriticAgent\n",
    "ai/agents/base_agent.py": "from ai.agents.base import BaseAgent\n"
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        f.write(content)
print("Stubs created.")
