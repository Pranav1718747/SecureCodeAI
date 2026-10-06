"""VCS Git operations provider."""

import subprocess
import structlog

logger = structlog.get_logger(__name__)


class GitProvider:
    """Handles Git version control operations."""
    
    def clone(self, repo_url: str, local_path: str, branch: str = None) -> None:
        """Clones a repository into a local path."""
        if not repo_url.startswith("http"):
            # Mock or local path provided
            return
            
        logger.info("vcs.git_provider.cloning", url=repo_url, path=local_path)
        clone_cmd = ["git", "clone", "--depth", "1"]
        if branch:
            clone_cmd.extend(["--branch", branch])
        clone_cmd.extend([repo_url, local_path])
        
        try:
            subprocess.run(
                clone_cmd,
                check=True,
                capture_output=True
            )
        except subprocess.CalledProcessError as e:
            if branch and "Remote branch" in str(e.stderr):
                # Fallback to cloning default branch if specified branch is missing
                clone_cmd = ["git", "clone", "--depth", "1", repo_url, local_path]
                subprocess.run(
                    clone_cmd,
                    check=True,
                    capture_output=True
                )
            else:
                raise e
