"""Services for Verification app."""

import time
import docker
import tempfile
import os
from .models import VerificationRun
from patches.models import Patch

class SandboxVerificationService:
    @staticmethod
    def run_verification(patch: Patch):
        """Runs security sandbox verification for a given patch."""
        # For MVP, we extract the unified diff and run syntax check
        
        passed = True
        log = ""
        exit_code = 0
        try:
            passed, log, exit_code = SandboxVerificationService.run_bandit(patch.diff_content)
        except Exception as e:
            passed = False
            log = str(e)
            exit_code = -1

        VerificationRun.objects.create(
            patch=patch,
            sast_tool='BANDIT',
            passed=passed,
            execution_time_seconds=2.0,
            exit_code=exit_code,
            stdout_log=log
        )
        
        if passed:
            patch.status = 'VERIFIED'
        else:
            patch.status = 'REJECTED'
        patch.save()
        
        return passed

    @staticmethod
    def run_bandit(code_diff: str):
        """Spins up a docker container to run Bandit SAST on the code."""
        client = docker.from_env()
        
        # We need to create a temporary file to mount into the container
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as tmp_file:
            # MVP: Assuming diff is applied or we just scan the patch 
            # (In production, we'd apply the diff to the base code)
            tmp_file.write(code_diff)
            host_path = tmp_file.name

        try:
            # We run python:3.11-alpine, pip install bandit, and run bandit
            cmd = "sh -c 'pip install bandit -q && bandit -r /app/target.py -f json'"
            container = client.containers.run(
                image="python:3.11-alpine",
                command=cmd,
                volumes={host_path: {'bind': '/app/target.py', 'mode': 'ro'}},
                network_disabled=True,
                detach=False,
                remove=True
            )
            return True, container.decode('utf-8'), 0
        except docker.errors.ContainerError as e:
            return False, e.stderr.decode('utf-8') if e.stderr else str(e), e.exit_status
        except Exception as e:
            return False, str(e), -1
        finally:
            if os.path.exists(host_path):
                os.remove(host_path)

    @staticmethod
    def run_semgrep(file_path: str):
        pass

    @staticmethod
    def check_syntax(code_string: str):
        pass
