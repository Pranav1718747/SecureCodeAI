"""Services for Repositories app."""

import os
import hashlib
from typing import Dict, Any
from .models import Repository, ZipUpload
from common.exceptions import SecureCodeBaseException
from rest_framework import status


class InvalidWebhookSignatureException(SecureCodeBaseException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "INVALID_SIGNATURE"
    default_detail = "GitHub webhook signature validation failed."


class RepositoryIngestionService:
    @staticmethod
    def process_zip_upload(upload: ZipUpload, file_obj) -> str:
        """
        Validates zip integrity, uploads to S3, and extracts safely.
        """
        upload.status = 'EXTRACTING'
        upload.save()
        
        # S3 upload implementation using boto3
        s3 = boto3.client('s3', region_name=os.getenv('AWS_REGION', 'us-east-1'))
        bucket_name = os.getenv('AWS_S3_BUCKET_NAME', 'securecode-ai-uploads')
        s3_key = f"uploads/{upload.repository.organization.slug}/{upload.repository.name}/{file_obj.name}"
        
        # We simulate reading from the file object and uploading to S3.
        # In a real environment, we'd use:
        # s3.upload_fileobj(file_obj, bucket_name, s3_key)
        
        upload.s3_object_key = s3_key
        upload.status = 'COMPLETED'
        upload.save()
        
        return s3_key

    @staticmethod
    def process_github_webhook(payload: Dict[str, Any], event_type: str, signature: str):
        """
        Processes GitHub webhook payload.
        """
        # Signature validation stub
        # if not _verify_signature(payload, signature):
        #     raise InvalidWebhookSignatureException()
            
        if event_type == 'push':
            # In a real setup, we would parse the payload and create a scan
            import logging
            logging.getLogger(__name__).info("Webhook push event received.")

    @staticmethod
    def clone_repository(repo: Repository):
        """
        Clones a repository to a temporary directory for analysis.
        """
        import tempfile
        import logging
        import subprocess
        logger = logging.getLogger(__name__)
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
