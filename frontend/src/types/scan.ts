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
  code_context?: string;
  language?: string;
  context_line_start?: number;
  is_false_positive: boolean;
  created_at: string;
}

export interface PatchValidation {
  semgrep_passed: boolean;
  bandit_passed: boolean;
  syntax_passed: boolean;
  compilation_passed: boolean;
}

export interface FallbackFix {
  reason: string;
  limitations: string;
  confidence: string;
  before: string;
  after: string;
}

export interface AIPatchResponse {
  summary: string;
  reasoning: string;
  patch: string;
  diff: string;
  confidence: number;
  breaking_change: boolean;
  files_modified: string[];
  validation: PatchValidation;
  commit_message: string;
  pr_title: string;
  pr_description: string;
  fallback_fix?: FallbackFix;
}

export interface Patch {
  id: string;
  vulnerability: string; // ID
  diff_content: string;
  explanation: string;
  status: 'GENERATED' | 'VERIFYING' | 'VERIFIED' | 'PR_PREVIEW' | 'PR_OPENED' | 'ACCEPTED' | 'REJECTED';
  ai_response_json?: AIPatchResponse;
  pr_preview_data?: any;
  branch_name?: string;
  commit_sha?: string;
  pr_number?: number;
  pr_url?: string;
  created_at: string;
}

export interface AnalysisReport {
  business_impact: string;
  compliance_impact: string;
  remediation: string;
  secure_example: string;
  attack_scenario: string;
  fallback_fix: FallbackFix;
}

export interface GitCommandError {
  success: boolean;
  stage: string;
  command: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  category: string;
  reason: string;
  human_message: string;
  possible_fixes: string[];
  error?: string; // Fallback for unknown errors
}
