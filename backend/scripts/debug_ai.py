import os
import uuid
import tempfile
import django
from django.conf import settings

# Setup Django minimal context for structlog/django settings if needed
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from ai.agents.state import WorkflowState
from ai.agents.orchestrator import ScanOrchestrator

def debug_pipeline():
    print("--- STARTING PIPELINE DEBUG ---")
    orchestrator = ScanOrchestrator()
    
    # Create temp vulnerable file
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, "vuln.py")
    with open(file_path, "w") as f:
        f.write("import os\nos.system('echo Hello')\ncursor.execute(f'SELECT * FROM users WHERE id={user_input}')\n")
    
    state = WorkflowState(
        repository_id=uuid.uuid4(),
        local_repo_path=temp_dir,
        file_tree=["vuln.py"]
    )
    
    print("1. Planner Phase")
    planner_result = orchestrator.planner_agent.run(state)
    state = state.model_copy(update=planner_result)
    print(f"Scan Plan batches: {len(state.scan_plan.batches)}")
    
    print("2. Security Phase")
    security_result = orchestrator.security_agent.run(state)
    state = state.model_copy(update=security_result)
    print(f"Findings after SecurityAgent: {len(state.findings)}")
    for idx, f in enumerate(state.findings):
        print(f"  [{idx}] {f.vulnerability_type} at line {f.line_number}")
        
    print("3. Knowledge Phase")
    knowledge_result = orchestrator.knowledge_agent.run(state)
    state = state.model_copy(update=knowledge_result)
    print(f"Findings after KnowledgeAgent: {len(state.findings)}")
    
    print("4. Critic Phase")
    critic_result = orchestrator.critic_agent.run(state)
    print(f"Critic returned: {critic_result.keys()}")
    state = state.model_copy(update=critic_result)
    print(f"Findings after CriticAgent: {len(state.findings)}")
    
    print("--- FULL GRAPH RUN ---")
    state2 = WorkflowState(
        repository_id=uuid.uuid4(),
        local_repo_path=temp_dir,
        file_tree=["vuln.py"]
    )
    final_state = orchestrator.run_scan(state2)
    print(f"Final state findings count: {len(final_state.findings)}")
    print(f"Final state errors: {final_state.errors}")

if __name__ == "__main__":
    debug_pipeline()
