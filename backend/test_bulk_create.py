import os
import django
import uuid
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from reviews.models import Scan, Vulnerability

repo = Repository.objects.first()
scan = Scan.objects.create(repository=repo)

vulns = []
for i in range(3):
    v = Vulnerability(
        scan=scan,
        title=f"Test {i}",
        description="desc",
        severity="HIGH",
        file_path="test.py",
        line_start=1,
        line_end=1,
        snippet="code"
    )
    print(f"Before bulk_create: v.id = {v.id}")
    vulns.append(v)

created = Vulnerability.objects.bulk_create(vulns)
for v in created:
    print(f"After bulk_create: v.id = {v.id}")

db_vulns = list(Vulnerability.objects.filter(scan=scan))
print(f"DB count: {len(db_vulns)}")
for v in db_vulns:
    print(f"In DB: v.id = {v.id}")
