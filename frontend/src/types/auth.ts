export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'SYSTEM_ADMIN' | 'SECURITY_LEAD' | 'DEVELOPER';
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  sso_token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
