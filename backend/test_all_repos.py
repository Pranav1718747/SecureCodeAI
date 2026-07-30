import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
repos = Repository.objects.all()
for r in repos:
    print(f"Repo: {r.id} - {r.name} - URL: {r.clone_url} - Branch: {r.default_branch}")
