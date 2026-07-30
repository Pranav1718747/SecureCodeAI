import pytest
from rest_framework.test import APIClient
from accounts.models import User, Organization
import random
import string

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_client():
    client = APIClient()
    org = Organization.objects.create(name="QA Org", slug="qa-org")
    user = User.objects.create_user(email="qa@test.com", password="StrongPassword123!", organization=org)
    client.force_authenticate(user=user)
    return client

@pytest.mark.django_db
class TestAPIBruteforce:
    def test_authentication_bypass(self, api_client):
        """Ensure unauthenticated access correctly yields 401 Unauthorized globally."""
        endpoints = [
            '/api/v1/accounts/organizations/',
            '/api/v1/accounts/users/',
            '/api/v1/repositories/',
            '/api/v1/reviews/scans/',
            '/api/v1/patches/',
            '/api/v1/training/jobs/'
        ]
        
        for url in endpoints:
            response = api_client.get(url)
            assert response.status_code == 401, f"Failed auth boundary at {url}. Expected 401, got {response.status_code}"

    def test_malformed_jwt_injection(self, api_client):
        """Simulate malicious JWT injection."""
        api_client.credentials(HTTP_AUTHORIZATION='Bearer ' + 'A'*500)
        response = api_client.get('/api/v1/accounts/me/')
        assert response.status_code == 401, "Malformed JWT was not rejected with 401"
        
    def test_payload_fuzzing_oversized(self, auth_client):
        """Test API resilience against oversized and malicious text payloads."""
        massive_string = ''.join(random.choices(string.ascii_letters, k=10000))
        malicious_sql = "1'; DROP TABLE users; --"
        
        payload = {
            "name": massive_string,
            "description": malicious_sql
        }
        
        # We don't care if it's 400 (validation error) or 405 (method not allowed),
        # we just want to ensure it is NOT a 500 internal server error.
        response = auth_client.post('/api/v1/repositories/', data=payload)
        assert response.status_code != 500, f"Oversized payload crashed server! Got 500."

    def test_pagination_negative_integers(self, auth_client):
        """Ensure pagination handles negative numbers and boundary exploits gracefully."""
        response = auth_client.get('/api/v1/repositories/?page=-1&page_size=-5000')
        # DRF pagination usually defaults to 1 or raises 404 (NotFound) if page doesn't exist
        assert response.status_code in [200, 404], f"Negative pagination crashed server. Got {response.status_code}"
