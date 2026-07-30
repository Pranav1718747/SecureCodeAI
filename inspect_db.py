import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from reviews.models import Scan
from repositories.models import Repository

scan = Scan.objects.last()
print("=== LAST SCAN ===")
print("ID:", scan.id)
print("Repo:", scan.repository.name)
print("Clone URL:", scan.repository.clone_url)
print("Status:", scan.status)
print("Vulnerabilities:", scan.total_vulnerabilities)

print("\n=== REPO DETAILS ===")
repo = scan.repository
print("Full Name:", repo.full_name)
print("Is Private:", repo.is_private)

print("\n=== AGENT LOGS ===")
for log in scan.agent_logs.all():
    print(f"[{log.agent_name} Step {log.step_index}] Tokens: {log.input_tokens} in / {log.output_tokens} out")
    print(log.thought)
    print("---")
