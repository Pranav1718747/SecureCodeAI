"""Models for Repositories app."""

from django.db import models
from common.models import TimeStampedModel
from accounts.models import Organization, User


class RepositoryQuerySet(models.QuerySet):
    def for_tenant(self, org_id):
        return self.filter(organization_id=org_id)


class Repository(TimeStampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='repositories')
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    github_repo_id = models.BigIntegerField(null=True, blank=True, unique=True)
    clone_url = models.URLField(max_length=500, null=True, blank=True)
    default_branch = models.CharField(max_length=100, default='main')
    is_private = models.BooleanField(default=True)
    language = models.CharField(max_length=50, default='python')
    ast_index_status = models.CharField(
        max_length=20,
        default='NOT_INDEXED',
        choices=[
            ('NOT_INDEXED', 'Not Indexed'),
            ('INDEXING', 'Indexing'),
            ('INDEXED', 'Indexed'),
            ('FAILED', 'Failed')
        ]
    )

    objects = RepositoryQuerySet.as_manager()

    class Meta:
        unique_together = ('organization', 'name')
        verbose_name_plural = 'Repositories'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.organization.slug}/{self.name}"


class ZipUpload(TimeStampedModel):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='zip_uploads')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    s3_object_key = models.CharField(max_length=1024, null=True, blank=True)
    file_size_bytes = models.BigIntegerField(null=True, blank=True)
    file_hash_sha256 = models.CharField(max_length=64, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        default='PENDING',
        choices=[
            ('PENDING', 'Pending'),
            ('EXTRACTING', 'Extracting'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed')
        ]
    )
    extracted_path = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return f"ZipUpload for {self.repository.name} ({self.status})"
