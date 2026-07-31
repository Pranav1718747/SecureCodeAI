import api from './api';
import { Repository, PaginatedResponse, AddRepositoryPayload, GitHubRepo } from '../types/repository';

export const repositoryService = {
  getRepositories: async (): Promise<PaginatedResponse<Repository>> => {
    const response = await api.get<PaginatedResponse<Repository>>('/repositories/');
    return response.data;
  },

  getRepository: async (id: string): Promise<Repository> => {
    const response = await api.get<Repository>(`/repositories/${id}/`);
    return response.data;
  },

  addRepository: async (payload: AddRepositoryPayload): Promise<Repository> => {
    const response = await api.post<Repository>('/repositories/', payload);
    return response.data;
  },

  deleteRepository: async (id: string): Promise<void> => {
    await api.delete(`/repositories/${id}/`);
  },

  refreshRepository: async (id: string): Promise<Repository> => {
    const response = await api.patch<Repository>(`/repositories/${id}/refresh/`);
    return response.data;
  },

  getGitHubUserRepos: async (): Promise<GitHubRepo[]> => {
    const response = await api.get<GitHubRepo[]>('/repositories/github-user-repos/');
    return response.data;
  }
};

