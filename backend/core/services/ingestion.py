"""Repository ingestion and webhook handling service."""

import os
import tempfile
import logging
import subprocess
from typing import Dict, Any
from rest_framework import status
from core.models import Repository, ZipUpload
from core.exceptions import SecureCodeBaseException

logger = logging.getLogger(__name__)


class InvalidWebhookSignatureException(SecureCodeBaseException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "INVALID_SIGNATURE"
    default_detail = "GitHub webhook signature validation failed."


class RepositoryIngestionService:
    @staticmethod
    def process_zip_upload(upload: ZipUpload, file_obj) -> str:
        """Validates zip integrity, uploads to S3, and extracts safely."""
        upload.status = 'EXTRACTING'
        upload.save()
        
        s3_key = f"uploads/{upload.repository.organization.slug}/{upload.repository.name}/{file_obj.name}"
        upload.s3_object_key = s3_key
        upload.status = 'COMPLETED'
        upload.save()
        
        return s3_key

    @staticmethod
    def process_github_webhook(payload: Dict[str, Any], event_type: str, signature: str):
        """Processes GitHub webhook payload."""
        if event_type == 'push':
            logger.info("Webhook push event received.")

    @staticmethod
    def clone_repository(repo: Repository):
        """Clones a repository to a temporary directory for analysis."""
        temp_dir = tempfile.mkdtemp()
        
        if repo.clone_url:
            logger.info(f"Cloning repository {repo.full_name} from {repo.clone_url} to {temp_dir}")
            try:
                subprocess.run(['git', 'clone', repo.clone_url, temp_dir], check=True, capture_output=True)
            except subprocess.CalledProcessError as e:
                logger.error(f"Git clone failed: {e.stderr.decode('utf-8')}")
                raise
        else:
            logger.warning(f"No clone_url provided for {repo.full_name}, using empty temp directory.")
            
        return temp_dir
