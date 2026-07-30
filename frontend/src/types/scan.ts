export interface Scan {
  id: string;
  repository: string; // ID
  branch_name: string;
  commit_hash: string | null;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  total_vulnerabilities: number;
  trigger_source: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  error_message?: string;
}

export interface Vulnerability {
  id: string;
  scan: string; // ID
  cwe_id: string;
  owasp_category: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number;
  file_path: string;
  line_start: number;
  line_end: number;
  snippet: string;
  is_false_positive: boolean;
  created_at: string;
}

export interface Patch {
  id: string;
  vulnerability: string; // ID
  diff_content: string;
  explanation: string;
  status: 'GENERATED' | 'APPLIED' | 'REJECTED';
  created_at: string;
}
