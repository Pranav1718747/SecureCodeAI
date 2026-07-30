"""Tasks for Verification app."""

from celery import shared_task
from .services import SandboxVerificationService

@shared_task
def run_verification_task(patch_id):
    from patches.models import Patch
    patch = Patch.objects.get(id=patch_id)
    SandboxVerificationService.run_verification(patch)
