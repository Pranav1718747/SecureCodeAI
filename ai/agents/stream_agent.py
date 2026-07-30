"""Streaming Agent Implementation.

Combines Security, Knowledge, and Critic agents to process a single file,
instantly saving results to the database and streaming to WebSockets.
"""

from typing import Any
import structlog
import os
import json
from asgiref.sync import async_to_sync

from ai.agents.state import WorkflowState, AgentError
from ai.security.agent import SecurityAgent
from ai.knowledge.agent import KnowledgeAgent
from ai.critic.agent import CriticAgent

logger = structlog.get_logger(__name__)

class StreamAgent:
    """Agent that orchestrates per-file analysis and real-time streaming."""
    
    def __init__(self):
        self.security_agent = SecurityAgent()
        self.knowledge_agent = KnowledgeAgent()
        self.critic_agent = CriticAgent()
        
    def _save_and_stream(self, finding, scan_id: str, state: WorkflowState):
        """Save a finding to Django DB and stream to Channels."""
        try:
            # We must import Django models lazily since this runs in a celery worker or script
            from reviews.models import Scan, Vulnerability
            from channels.layers import get_channel_layer
            
            scan = Scan.objects.get(id=scan_id)
            
            # 1. Save to database
            vuln = Vulnerability.objects.create(
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
            )
            
            # Increment total vulnerabilities on scan
            scan.total_vulnerabilities += 1
            scan.save(update_fields=['total_vulnerabilities'])
            
            # 2. Serialize for WebSocket
            vuln_data = {
                'id': str(vuln.id),
                'cwe_id': vuln.cwe_id,
                'owasp_category': vuln.owasp_category,
                'title': vuln.title,
                'description': vuln.description,
                'severity': vuln.severity,
                'confidence_score': vuln.confidence_score,
                'file_path': vuln.file_path,
                'line_start': vuln.line_start,
                'line_end': vuln.line_end,
                'snippet': vuln.snippet,
                'is_false_positive': vuln.is_false_positive,
                'created_at': vuln.created_at.isoformat(),
            }
            
            # 3. Stream to WebSocket group
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"scan_{scan_id}",
                    {
                        "type": "scan_update",
                        "data": {
                            "type": "new_vulnerability",
                            "vulnerability": vuln_data,
                            "progress": {
                                "processed_files": state.processed_files + 1,
                                "total_files": state.total_files
                            }
                        }
                    }
                )
        except Exception as e:
            logger.error("stream_agent.save_stream_failed", error=str(e))

    def _stream_progress(self, scan_id: str, file_path: str, state: WorkflowState):
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
                            "progress": {
                                "processed_files": state.processed_files + 1,
                                "total_files": state.total_files
                            }
                        }
                    }
                )
        except Exception as e:
            logger.error("stream_agent.stream_progress_failed", error=str(e))

    def run(self, state: WorkflowState) -> dict[str, Any]:
        """Process the next file in the queue."""
        if not state.files_to_scan:
            return {} # Nothing left to do
            
        # Copy to avoid mutating original state directly if passed by reference
        files_to_scan = list(state.files_to_scan)
        file_path = files_to_scan.pop(0)
        processed_files = state.processed_files
        all_findings = list(state.findings)
        
        logger.info("stream_agent.run.started", file_path=file_path)
        
        try:
            full_path = os.path.join(state.local_repo_path, file_path)
            content = ""
            if os.path.exists(full_path):
                with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                    
            if content:
                # 1. Security Analysis
                new_findings = self.security_agent.analyze_file_content(file_path, content)
                
                # 2. Knowledge + Critic Validation
                valid_findings = []
                for finding in new_findings:
                    # Optional: context = self.knowledge_agent.get_context(finding.vulnerability_type)
                    # For performance on streaming MVP, we bypass full RAG per finding or just validate directly
                    result = self.critic_agent.validate_finding(finding)
                    if result.is_valid:
                        valid_findings.append(finding)
                        all_findings.append(finding)
                        
                        # 3. Instantly Save and Stream
                        if state.scan_id:
                            self._save_and_stream(finding, state.scan_id, state)
            
            # Stream progress update even if no vulnerabilities found
            if state.scan_id:
                self._stream_progress(state.scan_id, file_path, state)
                
        except Exception as e:
            logger.error("stream_agent.run.failed", file_path=file_path, error=str(e))
            
        return {
            "files_to_scan": files_to_scan,
            "processed_files": processed_files + 1,
            "findings": all_findings
        }
