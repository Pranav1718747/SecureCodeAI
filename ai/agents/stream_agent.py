"""Streaming Agent Implementation.

Combines Security, Knowledge, and Critic agents to process BATCHES of files,
instantly saving results to the database and streaming to WebSockets.
Optimized for performance: batch LLM calls, bulk DB inserts, batched WS updates.
"""

from typing import Any
import structlog
import os
import json
import time
from asgiref.sync import async_to_sync

from ai.agents.state import WorkflowState, AgentError
from ai.security.agent import SecurityAgent
from ai.knowledge.agent import KnowledgeAgent
from ai.critic.agent import CriticAgent

logger = structlog.get_logger(__name__)

# Number of files to process per LLM batch request
BATCH_SIZE = 5


class StreamAgent:
    """Agent that orchestrates per-batch analysis and real-time streaming."""
    
    def __init__(self):
        self.security_agent = SecurityAgent()
        self.knowledge_agent = KnowledgeAgent()
        self.critic_agent = CriticAgent()
        
    def _bulk_save_and_stream(self, findings: list, scan_id: str, processed_files: int, total_files: int):
        """Save all findings to DB in bulk and stream a single WebSocket update."""
        if not findings:
            return
            
        try:
            from reviews.models import Scan, Vulnerability
            from channels.layers import get_channel_layer
            from django.db.models import F
            
            scan = Scan.objects.get(id=scan_id)
            
            # 1. Build Vulnerability objects for bulk_create
            vuln_objects = []
            for finding in findings:
                vuln_objects.append(Vulnerability(
                    scan=scan,
                    cwe_id=getattr(finding, 'cwe_id', ''),
                    owasp_category=finding.owasp_category.value if hasattr(finding.owasp_category, 'value') else str(finding.owasp_category),
                    title=finding.vulnerability_type,
                    description=f"{finding.description}\n\nExplanation: {finding.explanation}",
                    severity=finding.severity.value if hasattr(finding.severity, 'value') else str(finding.severity),
                    confidence_score=finding.confidence,
                    file_path=finding.file_path,
                    line_start=finding.line_number,
                    line_end=finding.line_number,
                    snippet=finding.code_snippet
                ))
            
            # 2. Single bulk insert instead of N individual creates
            created_vulns = Vulnerability.objects.bulk_create(vuln_objects)
            
            # 3. Atomic increment of total_vulnerabilities counter
            Scan.objects.filter(id=scan_id).update(
                total_vulnerabilities=F('total_vulnerabilities') + len(created_vulns)
            )
            
            # 4. Send ONE WebSocket event with all new vulnerabilities
            vuln_data_list = []
            for vuln in created_vulns:
                vuln_data_list.append({
                    'id': str(vuln.id),
                    'cwe_id': vuln.cwe_id,
                    'owasp_category': vuln.owasp_category,
                    'title': vuln.title,
                    'description': vuln.description,
                    'severity': vuln.severity,
                    'confidence_score': float(vuln.confidence_score),
                    'file_path': vuln.file_path,
                    'line_start': vuln.line_start,
                    'line_end': vuln.line_end,
                    'snippet': vuln.snippet,
                    'is_false_positive': vuln.is_false_positive,
                    'created_at': vuln.created_at.isoformat() if vuln.created_at else '',
                })
            
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"scan_{scan_id}",
                    {
                        "type": "scan_update",
                        "data": {
                            "type": "batch_vulnerabilities",
                            "vulnerabilities": vuln_data_list,
                            "scanner": "AI Analysis",
                            "progress": {
                                "processed_files": processed_files,
                                "total_files": total_files
                            }
                        }
                    }
                )
        except Exception as e:
            logger.error("stream_agent.bulk_save_stream_failed", error=str(e))

    def _stream_progress(self, scan_id: str, file_path: str, processed_files: int, total_files: int):
        """Stream progress update without a new vulnerability."""
        try:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"scan_{scan_id}",
                    {
                        "type": "scan_update",
                        "data": {
                            "type": "progress",
                            "file": file_path,
                            "scanner": "AI Analysis",
                            "progress": {
                                "processed_files": processed_files,
                                "total_files": total_files
                            }
                        }
                    }
                )
        except Exception as e:
            logger.error("stream_agent.stream_progress_failed", error=str(e))

    def run(self, state: WorkflowState) -> dict[str, Any]:
        """Process the next BATCH of files from the queue."""
        if not state.files_to_scan:
            return {}  # Nothing left to do
            
        # Pop a batch of files instead of just 1
        files_to_scan = list(state.files_to_scan)
        batch_files = files_to_scan[:BATCH_SIZE]
        remaining_files = files_to_scan[BATCH_SIZE:]
        processed_files = state.processed_files
        all_findings = list(state.findings)
        
        logger.info(
            "stream_agent.run.batch_started",
            batch_size=len(batch_files),
            remaining=len(remaining_files),
            files=batch_files,
        )
        
        t_start = time.time()
        
        import threading
        
        def emit_smooth_progress():
            """Emit progress updates one by one to keep the UI smooth during the LLM call."""
            for i, file_path in enumerate(batch_files):
                current_processed = processed_files + i + 1
                if state.scan_id:
                    self._stream_progress(state.scan_id, file_path, current_processed, state.total_files)
                # Sleep slightly to spread out updates over the typical 2-4s LLM window
                time.sleep(0.4)
                
        progress_thread = threading.Thread(target=emit_smooth_progress, daemon=True)
        progress_thread.start()
        
        try:
            # 1. Read all files in this batch
            file_contents: dict[str, str] = {}
            for file_path in batch_files:
                full_path = os.path.join(state.local_repo_path, file_path)
                if os.path.exists(full_path):
                    try:
                        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                            content = f.read()
                        if content.strip():
                            file_contents[file_path] = content
                    except Exception:
                        pass
            
            batch_findings = []
            
            if file_contents:
                # 2. Single LLM call for the entire batch
                new_findings = self.security_agent.analyze_batch(file_contents)
                
                # 3. Critic validation (deterministic rules only for speed)
                for finding in new_findings:
                    result = self.critic_agent.validate_finding(finding)
                    if result.is_valid:
                        batch_findings.append(finding)
                        all_findings.append(finding)
            
            new_processed = processed_files + len(batch_files)
            
            # Wait for smooth progress emission to finish to prevent race conditions
            progress_thread.join()
            
            # 4. Bulk DB insert + single WS event for all findings in this batch
            if batch_findings and state.scan_id:
                self._bulk_save_and_stream(
                    batch_findings, state.scan_id,
                    new_processed, state.total_files
                )
            
            t_end = time.time()
            logger.info(
                "stream_agent.run.batch_completed",
                batch_size=len(batch_files),
                findings_count=len(batch_findings),
                elapsed_seconds=round(t_end - t_start, 2),
            )
                
        except Exception as e:
            logger.error("stream_agent.run.batch_failed", error=str(e))
            new_processed = processed_files + len(batch_files)
            
        return {
            "files_to_scan": remaining_files,
            "processed_files": new_processed,
            "findings": all_findings
        }
