import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, Organization

org, _ = Organization.objects.get_or_create(
    name="Test Org",
    slug="test-org",
    domain="example.com"
)

if not User.objects.filter(email="admin@example.com").exists():
    user = User.objects.create_superuser(
        email="admin@example.com",
        password="admin",
        first_name="Admin",
        last_name="User",
        organization=org
    )
    print("Created user admin@example.com with password 'admin'")
else:
    print("User admin@example.com already exists")
