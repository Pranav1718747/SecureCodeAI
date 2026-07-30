import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from reviews.models import Scan
from accounts.models import User
from reviews.services import ScanOrchestrationService
import traceback

try:
    user = User.objects.first()
    repo, created = Repository.objects.get_or_create(
        full_name="octocat/Hello-World",
        defaults={
            "name": "Hello-World",
            "clone_url": "https://github.com/octocat/Hello-World",
            "default_branch": "master",
            "language": "Python"
        }
    )
    print(f"Repo {repo.name} created/found. Triggering scan...")
    scan = ScanOrchestrationService.trigger_scan(repo, user)
    print(f"Scan {scan.id} triggered. Status: {scan.status}")
    
    # Run it synchronously to see what happens
    print("Running execute_scan synchronously...")
    ScanOrchestrationService.execute_scan(scan.id)
    scan.refresh_from_db()
    print(f"Scan final status: {scan.status}")
    if scan.error_message:
        print(f"Error: {scan.error_message}")
        
except Exception as e:
    print(f"Exception: {e}")
    traceback.print_exc()
