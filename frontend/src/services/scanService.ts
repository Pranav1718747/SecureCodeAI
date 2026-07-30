import api from './api';
import { Scan, Vulnerability } from '../types/scan';
import { PaginatedResponse } from '../types/repository';

export const scanService = {
  getScans: async (repoId: string): Promise<PaginatedResponse<Scan>> => {
    const response = await api.get<PaginatedResponse<Scan>>(`/reviews/scans/?repository=${repoId}`);
    return response.data;
  },

  getScan: async (id: string): Promise<Scan> => {
    const response = await api.get<Scan>(`/reviews/scans/${id}/`);
    return response.data;
  },

  triggerScan: async (repoId: string, branchName: string = 'main'): Promise<Scan> => {
    const response = await api.post<Scan>('/reviews/scans/', {
      repository: repoId,
      branch_name: branchName
    });
    return response.data;
  },

  getVulnerabilities: async (scanId: string): Promise<PaginatedResponse<Vulnerability>> => {
    const response = await api.get<PaginatedResponse<Vulnerability>>(`/reviews/vulnerabilities/?scan_id=${scanId}`);
    return response.data;
  }
};
