import api from './api';
import { LoginCredentials, TokenResponse, User } from '../types/auth';

export const authService = {
  /**
   * Authenticate user and get JWT tokens
   */
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/accounts/token/', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/accounts/me/');
    return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
