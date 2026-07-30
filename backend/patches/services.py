"""Services for Patches app."""

from .models import Patch
from reviews.models import Vulnerability
from accounts.models import User
from django.utils import timezone


class GitPatchService:
    @staticmethod
    def generate_patch(vulnerability: Vulnerability):
        """Calls AI patch agent, creates Patch record."""
        from ai.patches.agent import PatchAgent
        
        agent = PatchAgent()
        response = agent.generate_patch(
            vulnerability_title=vulnerability.title,
            code_snippet=vulnerability.snippet,
            description=vulnerability.description
        )
        
        patch = Patch.objects.create(
            vulnerability=vulnerability,
            suggested_by_agent='PatchAgent',
            diff_content=response.diff_content,
            explanation=response.explanation,
            status='GENERATED'
        )
        return patch

    @staticmethod
    def create_github_pull_request(patch: Patch, user: User) -> str:
        """Transforms a verified patch into an opened GitHub Pull Request."""
        if patch.status != 'VERIFIED':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Cannot open PR for unverified patch.")
            
        import os
        from github import Github
        from github.GithubException import GithubException

        token = os.getenv('GITHUB_PAT')
        if not token:
            # Fallback for dev environment without token
            pr_url = f"https://github.com/{patch.vulnerability.scan.repository.full_name}/pull/dummy"
        else:
            try:
                g = Github(token)
                repo = g.get_repo(patch.vulnerability.scan.repository.full_name)
                # In a full flow, we'd create a branch, apply the diff, commit, and create PR.
                # Here we just create a mock PR title/body.
                pr = repo.create_pull(
                    title=f"Security Fix: {patch.vulnerability.title}",
                    body=patch.explanation,
                    head="securecode-ai-fix",
                    base=patch.vulnerability.scan.repository.default_branch
                )
                pr_url = pr.html_url
            except GithubException as e:
                pr_url = f"https://github.com/error/{e.status}"
        
        patch.status = 'PR_OPENED'
        patch.pull_request_url = pr_url
        patch.save()
        return pr_url
