"""Celery tasks for Repositories app."""

from celery import shared_task
from .models import ZipUpload
import zipfile
import os
import shutil

@shared_task
def extract_zip_upload_task(upload_id):
    """Background task to extract and process a ZIP upload."""
    try:
        upload = ZipUpload.objects.get(id=upload_id)
        upload.status = 'EXTRACTING'
        upload.save()

        # In a real scenario we download from S3 first.
        # But we simulate it here.
        # extraction_path = f"/tmp/securecode_extracted/{upload.id}"
        # os.makedirs(extraction_path, exist_ok=True)
        # with zipfile.ZipFile(local_zip_path, 'r') as zip_ref:
        #     zip_ref.extractall(extraction_path)

        upload.status = 'COMPLETED'
        upload.save()
    except Exception as e:
        upload = ZipUpload.objects.filter(id=upload_id).first()
        if upload:
            upload.status = 'FAILED'
            upload.save()
        raise e
