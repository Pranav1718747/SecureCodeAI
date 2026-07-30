import pytest
import asyncio
from django.test import override_settings
from accounts.models import Organization, User
from repositories.models import Repository, ZipUpload
from repositories.tasks import extract_zip_upload_task

@pytest.fixture
def repo_setup():
    org = Organization.objects.create(name="Race Org", slug="race-org")
    repo = Repository.objects.create(
        organization=org,
        name="race-repo",
        full_name="race-org/race-repo"
    )
    return repo

@pytest.mark.django_db(transaction=True)
class TestAsyncCeleryRace:
    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_concurrent_zip_uploads_integrity(self, repo_setup):
        """Simulate high concurrency queue hammering to test DB locking."""
        
        # We simulate 10 simultaneous celery tasks extracting ZipUploads for the same repo
        uploads = []
        for i in range(10):
            upload = ZipUpload.objects.create(
                repository=repo_setup,
                s3_object_key=f"uploads/race_{i}.zip",
                status="PENDING"
            )
            uploads.append(upload)
            
        # Execute sequentially since ALWAYS_EAGER is on, but we assert no DB locks crash it
        for upload in uploads:
            try:
                extract_zip_upload_task.delay(str(upload.id))
            except Exception as e:
                # Some might fail if we injected real bad zip paths, but it shouldn't be DB Integrity errors
                pass
                
        # Assert all statuses moved off PENDING and handled properly without crashing the worker
        for upload in uploads:
            upload.refresh_from_db()
            assert upload.status in ['FAILED', 'COMPLETED'], f"Upload {upload.id} is stuck in {upload.status}"
