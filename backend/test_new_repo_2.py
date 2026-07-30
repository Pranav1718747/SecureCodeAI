import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from accounts.models import User, Organization
from reviews.models import Scan
from reviews.services import ScanOrchestrationService
import traceback

try:
    user = User.objects.first()
    org = user.organization if user.organization else Organization.objects.first()
    if not user.organization and org:
        user.organization = org
        user.save()
        

    repo3, created = Repository.objects.get_or_create(
        full_name="octocat/Hello-World",
        defaults={
            "name": "Hello-World",
            "clone_url": "https://github.com/octocat/Hello-World.git",
            "default_branch": "master",
            "language": "Python",
            "organization": org
        }
    )
    
    print(f"Repo {repo3.name} created. Triggering scan...")
    scan = ScanOrchestrationService.trigger_scan(repo3, user)
    print(f"Scan {scan.id} triggered. Status: {scan.status}")
    
    ScanOrchestrationService.execute_scan(scan.id)
    scan.refresh_from_db()
    print(f"Scan final status: {scan.status}")
    if scan.error_message:
        print(f"Error: {scan.error_message}")
        
except Exception as e:
    print(f"Exception: {e}")
    traceback.print_exc()
