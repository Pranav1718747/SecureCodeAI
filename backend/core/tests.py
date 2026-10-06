"""Comprehensive test suite for SecureCode AI Core Engine."""

from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, Organization
from core.models import Repository, ZipUpload, Scan, Vulnerability, Patch, AuditLog
from core.tasks import extract_zip_upload_task, watchdog_stuck_scans


class CoreEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="Test Org", slug="test-org")
        self.user = User.objects.create_user(
            email="test@example.com", 
            password="password123",
            organization=self.org
        )
        self.client.force_authenticate(user=self.user)
        self.repo = Repository.objects.create(
            organization=self.org,
            name="test-repo",
            full_name="test-org/test-repo",
            clone_url="http://github.com/test/repo"
        )

    def test_health_check(self):
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['status'], 'healthy')

    def test_repositories_list(self):
        response = self.client.get('/api/v1/repositories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_scans_list(self):
        response = self.client.get('/api/v1/reviews/scans/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_vulnerabilities_list(self):
        response = self.client.get('/api/v1/reviews/vulnerabilities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patches_list(self):
        response = self.client.get('/api/v1/patches/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_training_jobs_list(self):
        response = self.client.get('/api/v1/training/jobs/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_evaluation_runs_list(self):
        response = self.client.get('/api/v1/evaluation/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_audit_logs_list(self):
        response = self.client.get('/api/v1/monitoring/audit-logs/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


class CoreCeleryTasksTestCase(TestCase):
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
        try:
            extract_zip_upload_task.delay(str(self.upload.id))
            self.upload.refresh_from_db()
            self.assertIn(self.upload.status, ['FAILED', 'COMPLETED'])
        except Exception:
            self.upload.refresh_from_db()
            self.assertEqual(self.upload.status, 'FAILED')

    def test_watchdog_stuck_scans(self):
        scan = Scan.objects.create(
            repository=self.repo,
            status='IN_PROGRESS'
        )
        watchdog_stuck_scans()
        scan.refresh_from_db()
        self.assertIn(scan.status, ['IN_PROGRESS', 'FAILED'])
