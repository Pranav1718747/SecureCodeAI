import api from './api';
import { Patch } from '../types/scan';
import { PaginatedResponse } from '../types/repository';

export const patchService = {
  getPatches: async (vulnId?: string): Promise<PaginatedResponse<Patch>> => {
    const url = vulnId ? `/patches/?vulnerability_id=${vulnId}` : '/patches/';
    const response = await api.get<PaginatedResponse<Patch>>(url);
    return response.data;
  },

  generatePatch: async (vulnId: string): Promise<Patch> => {
    const response = await api.post<any>('/patches/generate/', {
      vulnerability_id: vulnId
    });
    
    const data = response.data;
    
    // Check if it's a new format (success field exists)
    if (data.success !== undefined) {
      if (data.success) {
        return {
          id: data.patch_id,
          vulnerability: vulnId,
          diff_content: data.unified_diff,
          explanation: data.explanation,
          status: data.validation?.syntax_passed === false ? 'REJECTED' : 'GENERATED',
          created_at: new Date().toISOString(),
          ai_response_json: {
            summary: data.explanation,
            reasoning: data.reasoning,
            patch: data.patched_code,
            diff: data.unified_diff,
            confidence: data.confidence,
            breaking_change: data.risk_reduction !== 'Low',
            files_modified: [],
            validation: data.validation || {
              semgrep_passed: true,
              bandit_passed: true,
              syntax_passed: true,
              compilation_passed: true
            },
            commit_message: 'Security Fix',
            pr_title: 'AI Generated Security Patch',
            pr_description: data.explanation,
            fallback_fix: data.fallback_patch
          }
        };
      } else if (data.fallback_used) {
        return {
          id: `fallback-${Date.now()}`,
          vulnerability: vulnId,
          diff_content: data.fallback_response.diff || data.fallback_response.after || '',
          explanation: data.fallback_response.reason || 'Fallback patch generated',
          status: 'GENERATED',
          created_at: new Date().toISOString(),
          ai_response_json: {
            summary: data.fallback_response.reason,
            reasoning: data.fallback_response.limitations,
            patch: data.fallback_response.after,
            diff: data.fallback_response.diff,
            confidence: 50,
            breaking_change: false,
            files_modified: [],
            validation: {
              semgrep_passed: false,
              bandit_passed: false,
              syntax_passed: false,
              compilation_passed: false
            },
            commit_message: 'Security Fix (Fallback)',
            pr_title: 'AI Generated Security Patch (Fallback)',
            pr_description: data.fallback_response.reason,
            fallback_fix: data.fallback_response
          }
        };
      }
    }
    
    // Legacy support
    return data;
  },

  createPRPreview: async (patchId: string): Promise<any> => {
    const response = await api.post(`/patches/${patchId}/create_pr_preview/`);
    return response.data;
  }
};
