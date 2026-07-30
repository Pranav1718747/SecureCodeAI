"""Celery app initialization and configuration for SecureCode AI.

Sets up the Celery asynchronous task queue, loading configurations
directly from Django's settings module under the CELERY namespace.
"""

import os
from pathlib import Path
from celery import Celery
from dotenv import load_dotenv

# Load .env from project root (one level above backend/)
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("securecodeai")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Simple debug task to verify Celery worker is receiving messages."""
    print(f"Request: {self.request!r}")
