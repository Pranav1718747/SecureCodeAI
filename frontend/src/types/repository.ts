export interface Repository {
  id: string;
  name: string;
  full_name: string;
  owner?: string;
  clone_url: string;
  default_branch: string;
  is_private: boolean;
  language: string;
  ast_index_status: 'NOT_INDEXED' | 'INDEXING' | 'INDEXED' | 'FAILED';
  created_at: string;
  updated_at: string;
  security_score?: number;
  last_scan?: string;
}

export interface GitHubRepo {
  id: number | string;
  name: string;
  full_name: string;
  owner: string;
  clone_url: string;
  default_branch: string;
  is_private: boolean;
  language: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AddRepositoryPayload {
  name: string;
  full_name: string;
  clone_url: string;
  default_branch?: string;
  is_private?: boolean;
  language?: string;
}

