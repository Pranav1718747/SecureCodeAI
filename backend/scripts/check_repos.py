import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Repository

repos = Repository.objects.all()
for r in repos:
    print(f"Repo: {r.name} | Clone URL: {r.clone_url} | Default Branch: {r.default_branch}")
