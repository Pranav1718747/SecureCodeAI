import os
import sys

# Setup Django environment so that any models loaded inside AI agents work
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from ai.agents.state import WorkflowState
from ai.agents.orchestrator import ScanOrchestrator
import tempfile

def run_test():
    print("Initializing ScanOrchestrator...")
    orchestrator = ScanOrchestrator()
    
    print("Setting up real-world vulnerable code in temporary repo...")
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, "vuln_script.py")
    with open(file_path, "w") as f:
        f.write("def login(username, password):\n")
        f.write("    import sqlite3\n")
        f.write("    conn = sqlite3.connect('users.db')\n")
        f.write("    cursor = conn.cursor()\n")
        f.write("    # SQL Injection Vulnerability here:\n")
        f.write("    cursor.execute(f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\")\n")
        f.write("    return cursor.fetchone()\n")

    print(f"Created vulnerable script at {file_path}")
    
    # Create initial state
    class DummyScanPlan:
        class DummyBatch:
            def __init__(self, files):
                self.files = files
        batches = [DummyBatch(["vuln_script.py"])]

    import uuid
    initial_state = WorkflowState(
        repository_id=uuid.uuid4(),
        local_repo_path=temp_dir,
        file_tree=["vuln_script.py"]
    )

    print("\n--- Running LangGraph E2E Scan Pipeline ---")
    final_state = orchestrator.run_scan(initial_state)

    print("\n--- Pipeline Execution Completed ---")
    print(f"Total Findings Detected: {len(final_state.findings)}")
    for idx, finding in enumerate(final_state.findings):
        print(f"\nFinding #{idx + 1}: {finding.vulnerability_type}")
        print(f"Severity: {finding.severity}")
        print(f"Description: {finding.description}")
        print(f"Location: {finding.file_path}:{finding.line_number}")

    if final_state.errors:
        print("\nErrors encountered:")
        for err in final_state.errors:
            print(f"- {err.agent_name}: {err.message}")

if __name__ == '__main__':
    run_test()
