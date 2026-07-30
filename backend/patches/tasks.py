"""Celery tasks for Patches app."""

from celery import shared_task
from .services import GitPatchService

@shared_task
def generate_patch_task(vulnerability_id):
    from reviews.models import Vulnerability
    vuln = Vulnerability.objects.get(id=vulnerability_id)
    GitPatchService.generate_patch(vuln)
