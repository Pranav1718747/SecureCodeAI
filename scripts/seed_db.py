import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import Organization, User

def run():
    print("Seeding database...")
    org, created = Organization.objects.get_or_create(
        name="SecureCode Inc",
        slug="securecode-inc"
    )
    if created:
        print(f"Created organization: {org.name}")

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
    if created:
        user.set_password("SecureAdmin123!")
        user.save()
        print(f"Created admin user: {user.email}")
    else:
        print("Admin user already exists.")
        
    print("Database seeding completed.")

if __name__ == '__main__':
    run()
