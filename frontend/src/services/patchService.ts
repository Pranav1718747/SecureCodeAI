import api from './api';
import { Patch } from '../types/scan';
import { PaginatedResponse } from '../types/repository';

export const patchService = {
  getPatches: async (vulnId?: string): Promise<PaginatedResponse<Patch>> => {
    const url = vulnId ? `/patches/?vulnerability_id=${vulnId}` : '/patches/';
    const response = await api.get<PaginatedResponse<Patch>>(url);
    return response.data;
  },

  generatePatch: async (vulnId: string): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>('/patches/generate/', {
      vulnerability_id: vulnId
    });
    return response.data;
  }
};
