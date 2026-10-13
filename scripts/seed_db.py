import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Organization, User

def run():
    print("Seeding database...")
    org, _ = Organization.objects.get_or_create(
        slug="securecode-inc",
        defaults={
            "name": "SecureCode Inc",
            "domain": "securecode-ai.com",
            "subscription_plan": "ENTERPRISE_CUSTOM",
        }
    )

    # 1. Primary Enterprise Admin
    user, created = User.objects.get_or_create(
        email="admin@securecode-ai.com",
        defaults={
            "first_name": "Admin",
            "last_name": "User",
            "organization": org,
            "role": "OWNER",
            "is_staff": True,
            "is_superuser": True,
        }
    )
    user.set_password("SecureAdmin123!")
    user.save()
    print(f"Configured admin user: admin@securecode-ai.com (Password: SecureAdmin123!)")

    # 2. Secondary demo user for testing
    user2, _ = User.objects.get_or_create(
        email="admin@example.com",
        defaults={
            "first_name": "Security",
            "last_name": "Lead",
            "organization": org,
            "role": "SECURITY_LEAD",
            "is_staff": True,
            "is_superuser": True,
        }
    )
    user2.set_password("admin")
    user2.save()
    print(f"Configured demo user: admin@example.com (Password: admin)")

    print("Database seeding completed.")

if __name__ == '__main__':
    run()
