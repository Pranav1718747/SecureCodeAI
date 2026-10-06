import os
import django
import uuid
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
from ai.agents.orchestrator import ScanOrchestrator
from ai.agents.state import WorkflowState

# Mock agents to just pass through
class MockPlanner:
    def run(self, state):
        return {"files_to_scan": ["file"] * 200, "total_files": 200, "processed_files": 0, "findings": []}
class MockStream:
    def run(self, state):
        files = list(state.files_to_scan) if hasattr(state, 'files_to_scan') else state.get("files_to_scan", [])
        return {"files_to_scan": files[5:], "processed_files": getattr(state, "processed_files", 0) + 5}

orc = ScanOrchestrator()
orc.planner_agent = MockPlanner()
orc.stream_agent = MockStream()
try:
    orc.run_scan(WorkflowState(repository_id=uuid.uuid4(), scan_id=str(uuid.uuid4()), repository_url="", local_repo_path="", branch="", file_tree=[]))
    print("SUCCESS")
except Exception as e:
    import traceback
    print("FAILED:", type(e).__name__)
    traceback.print_exc()
