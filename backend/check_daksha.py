import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from reviews.models import Scan

repo = Repository.objects.filter(full_name__icontains="Shooter-ai-Agent-Demo").first()
if repo:
    scans = Scan.objects.filter(repository=repo)
    print(f"Found {scans.count()} scans for {repo.full_name}")
    for scan in scans:
        print(f"Scan ID: {scan.id}, Status: {scan.status}, Error: {scan.error_message}")
else:
    print("Daksha repo not found")
