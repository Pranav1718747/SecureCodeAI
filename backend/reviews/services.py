"""Services for Reviews app."""

from django.utils import timezone
from .models import Scan, Vulnerability
from repositories.models import Repository
from accounts.models import User
from .tasks import execute_langgraph_scan

class ScanOrchestrationService:
    @staticmethod
    def trigger_scan(repo: Repository, user: User, branch: str = None, commit: str = None) -> Scan:
        """Creates a Scan record and dispatches the Celery task."""
        scan = Scan.objects.create(
            repository=repo,
            triggered_by=user,
            trigger_source='MANUAL',
            branch_name=branch,
            commit_hash=commit,
            status='QUEUED'
        )
        
        execute_langgraph_scan.delay(scan.id)
        return scan

    @staticmethod
    def execute_scan(scan_id: str):
        """
        Loads repo file tree, builds WorkflowState, calls ScanOrchestrator.
        Updates DB records. Stub for MVP.
        """
        import traceback
        import structlog
        
        logger = structlog.get_logger(__name__)
        scan = Scan.objects.get(id=scan_id)
        scan.status = 'IN_PROGRESS'
        scan.started_at = timezone.now()
        scan.save()
        
        try:
            import tempfile
            import subprocess
            import os
            import time
            from ai.agents.orchestrator import ScanOrchestrator
            from ai.agents.state import WorkflowState
            
            print(f"[{timezone.now().isoformat()}] [Stage 1] Clone Repository - START", flush=True)
            repo_url = scan.repository.clone_url or "local://stub"
            branch = scan.branch_name or scan.repository.default_branch
            
            # Temporary directory for cloning
            temp_dir_obj = tempfile.TemporaryDirectory()
            local_repo_path = temp_dir_obj.name
            
            # Clone the repository
            if repo_url.startswith("http"):
                logger.info("execute_scan.cloning", repo_url=repo_url, path=local_repo_path)
                clone_cmd = ["git", "clone", "--depth", "1"]
                if branch:
                    clone_cmd.extend(["--branch", branch])
                clone_cmd.extend([repo_url, local_repo_path])
                
                try:
                    subprocess.run(
                        clone_cmd,
                        check=True,
                        capture_output=True
                    )
                except subprocess.CalledProcessError as e:
                    if branch and "Remote branch" in str(e.stderr):
                        clone_cmd = ["git", "clone", "--depth", "1", repo_url, local_repo_path]
                        subprocess.run(
                            clone_cmd,
                            check=True,
                            capture_output=True
                        )
                    else:
                        raise e
            print(f"[{timezone.now().isoformat()}] [Stage 1] Clone Repository - END", flush=True)
            
            print(f"[{timezone.now().isoformat()}] [Stage 2] Analyze Files - START", flush=True)
            # Generate file tree with aggressive filtering
            SKIP_DIRS = {
                ".git", "__pycache__", "node_modules", "venv", ".venv",
                "env", ".env", "dist", "build", "target", "coverage",
                ".tox", ".mypy_cache", ".pytest_cache", ".next",
                ".nuxt", "vendor", "bower_components", "eggs",
                ".eggs", "site-packages", "migrations", "staticfiles",
            }
            SKIP_EXTENSIONS = {
                # Binary / media
                ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico",
                ".svg", ".webp", ".mp3", ".mp4", ".avi", ".mov",
                ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
                ".woff", ".woff2", ".ttf", ".eot", ".otf",
                ".pyc", ".pyo", ".so", ".dll", ".exe", ".o",
                ".class", ".jar", ".war", ".bin", ".dat",
                ".sqlite3", ".db",
                # Lock files
                ".lock",
            }
            SKIP_FILENAMES = {
                "package-lock.json", "yarn.lock", "poetry.lock",
                "Pipfile.lock", "composer.lock", "Gemfile.lock",
                "pnpm-lock.yaml", ".DS_Store", "Thumbs.db",
                ".gitignore", ".gitattributes", "LICENSE", "LICENSE.md",
                "CHANGELOG.md", "CONTRIBUTING.md",
            }
            SOURCE_EXTENSIONS = {
                ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go",
                ".rs", ".c", ".cpp", ".h", ".hpp", ".cs", ".rb",
                ".php", ".swift", ".kt", ".scala", ".sql", ".sh",
                ".bash", ".env", ".yml", ".yaml", ".json", ".xml",
                ".html", ".css", ".scss", ".less", ".vue", ".svelte",
                ".tf", ".hcl", ".toml", ".ini", ".cfg", ".conf",
            }
            
            file_tree = []
            for root, dirs, files in os.walk(local_repo_path):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                
                for file in files:
                    _, ext = os.path.splitext(file)
                    ext_lower = ext.lower()
                    
                    # Skip by filename
                    if file in SKIP_FILENAMES:
                        continue
                    # Skip by extension
                    if ext_lower in SKIP_EXTENSIONS:
                        continue
                    # Only include known source extensions (skip unknowns)
                    if ext_lower and ext_lower not in SOURCE_EXTENSIONS:
                        continue
                    
                    full_path = os.path.join(root, file)
                    # Skip files larger than 100KB (likely generated)
                    try:
                        if os.path.getsize(full_path) > 100_000:
                            continue
                    except OSError:
                        continue
                    
                    rel_path = os.path.relpath(full_path, local_repo_path)
                    file_tree.append(rel_path)
            
            logger.info("execute_scan.file_tree_generated", file_count=len(file_tree))
            
            state = WorkflowState(
                repository_id=scan.repository.id,
                scan_id=str(scan.id),
                repository_url=repo_url,
                local_repo_path=local_repo_path,
                branch=branch,
                file_tree=file_tree
            )
            print(f"[{timezone.now().isoformat()}] [Stage 2] Analyze Files - END", flush=True)
            
            print(f"[{timezone.now().isoformat()}] [Stage 3] Detect Vulnerabilities - START", flush=True)
            orchestrator = ScanOrchestrator()
            final_state = orchestrator.run_scan(state)
            print(f"[{timezone.now().isoformat()}] [Stage 3] Detect Vulnerabilities - END", flush=True)
            
            print(f"[{timezone.now().isoformat()}] [Stage 4] Cleanup - START", flush=True)
            # Cleanup
            temp_dir_obj.cleanup()
            print(f"[{timezone.now().isoformat()}] [Stage 4] Cleanup - END", flush=True)
            
            print(f"[{timezone.now().isoformat()}] [Stage 5] Update Scan Status - START", flush=True)
            # Vulnerabilities are now created incrementally by the StreamAgent
            # We just need to update the final status
            scan.status = 'COMPLETED'
            print(f"[{timezone.now().isoformat()}] [Stage 5] Update Scan Status - END", flush=True)
            
        except Exception as e:
            print(f"[{timezone.now().isoformat()}] ERROR encountered: {e}", flush=True)
            logger.error("execute_scan.failed", scan_id=scan_id, error=str(e), traceback=traceback.format_exc())
            scan.status = 'FAILED'
            
            # Extract meaningful error message for the UI
            import subprocess
            if isinstance(e, subprocess.CalledProcessError):
                error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
                scan.error_message = f"Git Clone Failed: {error_msg.strip()}"
            else:
                scan.error_message = f"Analysis Failed: {str(e)}"
                
        finally:
            print(f"[{timezone.now().isoformat()}] [Stage 6] Final Database Write - START", flush=True)
            # Preserve the final status and error message determined in the block above
            final_status = scan.status
            final_error = scan.error_message
            
            # Refresh to not overwrite total_vulnerabilities accumulated by StreamAgent
            scan.refresh_from_db()
            
            # Re-apply final status
            scan.status = final_status
            scan.error_message = final_error
            scan.completed_at = timezone.now()
            
            scan.save(update_fields=['completed_at', 'status', 'error_message'])
            print(f"[{timezone.now().isoformat()}] [Stage 6] Final Database Write - END", flush=True)

    @staticmethod
    def mark_false_positive(vuln_id: str, user: User):
        """Toggles is_false_positive flag."""
        vuln = Vulnerability.objects.get(id=vuln_id)
        vuln.is_false_positive = not vuln.is_false_positive
        vuln.save()
        return vuln
