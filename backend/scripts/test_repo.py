import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Repository
from core.models import Scan

repo = Repository.objects.get(name='Shooter-ai-Agent-Demo')
print(f"Repo: {repo.name}, Default Branch: {repo.default_branch}, Clone URL: {repo.clone_url}")

scans = Scan.objects.filter(repository=repo)
for s in scans:
    print(f"Scan {s.id} - Branch: {s.branch_name} - Status: {s.status}")
