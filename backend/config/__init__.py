"""Django project initialization and Celery app discovery."""

from .celery import app as celery_app

__all__ = ["celery_app"]
