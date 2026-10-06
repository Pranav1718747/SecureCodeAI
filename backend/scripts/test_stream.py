import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from ai.agents.state import WorkflowState
from ai.agents.stream_agent import StreamAgent

state = WorkflowState(
    repository_id='00000000-0000-0000-0000-000000000000',
    files_to_scan=['file1.py', 'file2.py'],
    total_files=2
)
print("Initial state created")
