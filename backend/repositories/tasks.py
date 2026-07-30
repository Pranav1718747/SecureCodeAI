"""Celery tasks for Repositories app."""

from celery import shared_task
from .models import ZipUpload
from .services import RepositoryIngestionService

@shared_task
def extract_zip_upload_task(upload_id):
    """Background task to extract and process a ZIP upload."""
    pass
