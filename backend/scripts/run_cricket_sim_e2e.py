import os
import sys
import django
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')

from django.test import Client
from accounts.models import User, Organization
from rest_framework_simplejwt.tokens import RefreshToken
import json

def run_e2e():
    print("[Step 1] Authenticating...")
    org, _ = Organization.objects.get_or_create(name='FuzzOrg', slug='fuzzorg')
    user, _ = User.objects.get_or_create(email='admin@example.com', defaults={'organization': org, 'role': 'SECURITY_LEAD'})
    user.set_password('adminpass')
    user.save()
    
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    
    client = Client(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # Check if repo exists
    print("[Step 2] Checking for cricket-simulator repository...")
    repo_url = "https://github.com/Pranav1718747/cricket-simulator"
    res = client.get('/api/v1/repositories/')
    repos = res.json().get('results', [])
    
    repo_id = None
    for r in repos:
        if r.get('clone_url') == repo_url or r.get('clone_url') == repo_url + ".git":
            repo_id = r['id']
            print(f"Found existing repository with ID: {repo_id}")
            break
            
    if not repo_id:
        print("Repository not found. Adding it via API...")
        add_res = client.post('/api/v1/repositories/', data={
            "name": "cricket-simulator",
            "full_name": "Pranav1718747/cricket-simulator",
            "clone_url": repo_url + ".git",
            "default_branch": "main",
            "is_private": False,
            "language": "python"
        }, content_type='application/json')
        
        if add_res.status_code == 201:
            repo_id = add_res.json()['id']
            print(f"Successfully added repository with ID: {repo_id}")
        else:
            print(f"Failed to add repository: {add_res.content}")
            return
            
    # Trigger scan
    print(f"[Step 3] Triggering AI scan for repository {repo_id}...")
    scan_res = client.post('/api/v1/reviews/scans/', data={
        "repository": repo_id,
        "branch_name": "main"
    }, content_type='application/json')
    
    if scan_res.status_code == 201:
        scan_id = scan_res.json()['id']
        print(f"Successfully triggered scan with ID: {scan_id}")
    else:
        print(f"Failed to trigger scan: {scan_res.content}")
        return
        
    # In a real async celery setup, we would wait.
    # Since we are using the test client, the celery task might be dispatched asynchronously if CELERY_TASK_ALWAYS_EAGER is not True.
    # Let's check status.
    print("[Step 4] Checking scan status...")
    status_res = client.get(f'/api/v1/reviews/scans/{scan_id}/')
    print(f"Scan Status: {status_res.json().get('status')}")
    
    # We might need to manually run the scan if it's PENDING because Celery might not be running in this test script.
    from core.services import ScanOrchestrationService, trigger_scan
from core.services.vcs import GitProvider
from core.services.notifier import WebSocketNotifier
from core.services.scanner import FileScannerService
from ai.agents.orchestrator import ScanOrchestrator
    from core.models import Scan
    scan_obj = Scan.objects.get(id=scan_id)
    if scan_obj.status in ['PENDING', 'QUEUED']:
        print("Manually executing scan orchestration (since Celery worker isn't running in this script)...")
        from core.tasks import execute_langgraph_scan
        execute_langgraph_scan(scan_id)
        
    # Get vulnerabilities
    print("[Step 5] Fetching vulnerabilities...")
    vuln_res = client.get(f'/api/v1/reviews/vulnerabilities/?scan_id={scan_id}')
    vulns = vuln_res.json().get('results', [])
    print(f"Found {len(vulns)} vulnerabilities.")
    
    # Generate patches
    print("[Step 6] Generating patches for vulnerabilities...")
    for v in vulns:
        print(f"  -> Triggering patch for Vuln ID {v['id']} ({v['severity']})")
        patch_res = client.post('/api/v1/patches/generate/', data={
            "vulnerability_id": v['id']
        }, content_type='application/json')
        
        # Again, manually execute celery task
        from patches.tasks import generate_patch_task
        generate_patch_task(v['id'])
        
    # Check generated patches
    print("[Step 7] Checking generated patches...")
    patches_res = client.get('/api/v1/patches/')
    patches = patches_res.json().get('results', [])
    for p in patches:
        print(f"\n--- Patch for Vuln {p['vulnerability']} ---")
        print(f"Explanation: {p['explanation']}")
        print(f"Diff:\n{p['diff_content'][:100]}...")
        
    print("\n[Done] Full E2E completed successfully!")

if __name__ == '__main__':
    run_e2e()
