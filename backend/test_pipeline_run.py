import os
import django
import logging
logging.basicConfig(level=logging.INFO)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from reviews.models import Scan
from accounts.models import User
from reviews.services import ScanOrchestrationService

user = User.objects.first()
repo = Repository.objects.first()

scan = Scan.objects.create(
    repository=repo,
    triggered_by=user,
    trigger_source='MANUAL',
    status='QUEUED'
)
print(f"Created scan {scan.id}")

try:
    ScanOrchestrationService.execute_scan(str(scan.id))
    scan.refresh_from_db()
    print(f"Final DB Status: {scan.status}")
except Exception as e:
    print(f"Test failed with {e}")
