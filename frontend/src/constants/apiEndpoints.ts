/** Centralized API route constants for Django REST backend communication. */

const API_BASE = '/api/v1';

export const ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE}/accounts/token/`,
  REFRESH: `${API_BASE}/accounts/token/refresh/`,
  REGISTER: `${API_BASE}/accounts/register/`,
  ME: `${API_BASE}/accounts/me/`,

  // Repositories
  REPOSITORIES: `${API_BASE}/repositories/`,
  REPOSITORY: (id: string) => `${API_BASE}/repositories/${id}/`,
  REPOSITORY_SYNC: (id: string) => `${API_BASE}/repositories/${id}/sync/`,
  REPOSITORY_UPLOAD_ZIP: `${API_BASE}/repositories/upload_zip/`,

  // Reviews / Scans
  SCANS: `${API_BASE}/reviews/scans/`,
  SCAN: (id: string) => `${API_BASE}/reviews/scans/${id}/`,
  VULNERABILITIES: `${API_BASE}/reviews/vulnerabilities/`,
  VULNERABILITY: (id: string) => `${API_BASE}/reviews/vulnerabilities/${id}/`,

  // Patches
  PATCHES: `${API_BASE}/patches/`,
  PATCH: (id: string) => `${API_BASE}/patches/${id}/`,
  PATCH_GENERATE: `${API_BASE}/patches/generate/`,
  PATCH_APPLY_PR: (id: string) => `${API_BASE}/patches/${id}/apply_pr/`,

  // Training
  FEEDBACK_EVENTS: `${API_BASE}/training/feedback/`,
  FINE_TUNING_JOBS: `${API_BASE}/training/jobs/`,
  TRIGGER_TRAINING: `${API_BASE}/training/jobs/trigger/`,

  // Evaluation
  EVALUATIONS: `${API_BASE}/evaluation/evaluations/`,
  RUN_EVALUATION: `${API_BASE}/evaluation/evaluations/run/`,

  // Monitoring
  AUDIT_LOGS: `${API_BASE}/monitoring/audit-logs/`,

  // Verification
  VERIFICATIONS: `${API_BASE}/verification/runs/`,

  // Health
  HEALTH: `${API_BASE}/health/`,
} as const;
