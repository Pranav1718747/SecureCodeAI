from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from accounts.models import User, Organization
from rest_framework import status

class CoreAPIEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="Test Org", slug="test-org")
        self.user = User.objects.create_user(
            email="test@example.com", 
            password="password123",
            organization=self.org
        )
        self.client.force_authenticate(user=self.user)

    def test_organizations_list(self):
        response = self.client.get('/api/v1/accounts/organizations/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_users_list(self):
        response = self.client.get('/api/v1/accounts/users/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def test_repositories_list(self):
        response = self.client.get('/api/v1/repositories/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_scans_list(self):
        response = self.client.get('/api/v1/reviews/scans/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_vulnerabilities_list(self):
        response = self.client.get('/api/v1/reviews/vulnerabilities/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_patches_list(self):
        response = self.client.get('/api/v1/patches/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_training_jobs_list(self):
        response = self.client.get('/api/v1/training/jobs/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_evaluation_runs_list(self):
        response = self.client.get('/api/v1/evaluation/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_audit_logs_list(self):
        response = self.client.get('/api/v1/monitoring/audit-logs/')
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
