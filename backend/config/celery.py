"""Celery app initialization and configuration for SecureCode AI.

Sets up the Celery asynchronous task queue, loading configurations
directly from Django's settings module under the CELERY namespace.
"""

import os
from pathlib import Path
from celery import Celery
from dotenv import load_dotenv


_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("securecodeai")

app.config_from_object("django.conf:settings", namespace="CELERY")


app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Simple debug task to verify Celery worker is receiving messages."""
    print(f"Request: {self.request!r}")
