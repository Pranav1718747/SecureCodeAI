import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Patch
from patches.remediation_services import PatchApplicationService, analyze_git_error, GitCommandError
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

patch = Patch.objects.last()
print(f"Testing PR for patch {patch.id}")
try:
    PatchApplicationService.apply_patch(patch, logger)
except GitCommandError as e:
    print(f"FAILED GitCommandError:")
    print(f"Stage: {e.stage}")
    print(f"Command: {e.result.command}")
    print(f"Stdout: {e.result.stdout}")
    print(f"Stderr: {e.result.stderr}")
except Exception as e:
    import traceback
    traceback.print_exc()
