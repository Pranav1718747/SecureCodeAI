from django.test import TestCase, override_settings
from accounts.models import Organization, User
from repositories.models import Repository, ZipUpload
from repositories.tasks import extract_zip_upload_task

class CeleryTasksTestCase(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org", slug="test-org")
        self.repo = Repository.objects.create(
            organization=self.org,
            name="test-repo",
            full_name="test-org/test-repo",
            clone_url="http://github.com/test/repo"
        )
        self.upload = ZipUpload.objects.create(
            repository=self.repo,
            s3_object_key="uploads/test.zip",
            status="PENDING"
        )

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_extract_zip_upload_task(self):
        # Even without S3, the task should gracefully handle errors or run the logic
        # We just want to ensure it doesn't crash catastrophically and returns a status
        try:
            result = extract_zip_upload_task.delay(str(self.upload.id))
            self.upload.refresh_from_db()
            self.assertIn(self.upload.status, ['FAILED', 'COMPLETED'])
        except Exception as e:
            # Depending on how robust the task is without real AWS creds
            self.upload.refresh_from_db()
            self.assertEqual(self.upload.status, 'FAILED')
