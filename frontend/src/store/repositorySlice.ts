/** Redux slice managing active repository selection, file tree structure, and git branches. */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Repository, AddRepositoryPayload } from '../types/repository';
import { repositoryService } from '../services/repositoryService';

interface RepositoryState {
  repositories: Repository[];
  activeRepository: Repository | null;
  loading: boolean;
  error: string | null;
}

const initialState: RepositoryState = {
  repositories: [],
  activeRepository: null,
  loading: false,
  error: null,
};

export const fetchRepositories = createAsyncThunk(
  'repositories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await repositoryService.getRepositories();
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to load repositories');
    }
  }
);

export const fetchRepository = createAsyncThunk(
  'repositories/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      return await repositoryService.getRepository(id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to load repository');
    }
  }
);

export const addRepository = createAsyncThunk(
  'repositories/add',
  async (payload: AddRepositoryPayload, { rejectWithValue }) => {
    try {
      return await repositoryService.addRepository(payload);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to add repository');
    }
  }
);

export const removeRepository = createAsyncThunk(
  'repositories/remove',
  async (id: string, { rejectWithValue }) => {
    try {
      await repositoryService.deleteRepository(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove repository');
    }
  }
);

export const refreshRepository = createAsyncThunk(
  'repositories/refresh',
  async (id: string, { rejectWithValue }) => {
    try {
      return await repositoryService.refreshRepository(id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to refresh repository');
    }
  }
);

const repositorySlice = createSlice({
  name: 'repositories',
  initialState,
  reducers: {
    setActiveRepository(state, action: PayloadAction<Repository | null>) {
      state.activeRepository = action.payload;
    },
    clearRepositories(state) {
      state.repositories = [];
      state.activeRepository = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload.results;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRepository.fulfilled, (state, action) => {
        state.activeRepository = action.payload;
      })
      .addCase(addRepository.fulfilled, (state, action) => {
        const exists = state.repositories.some((r) => r.id === action.payload.id);
        if (!exists) {
          state.repositories.unshift(action.payload);
        }
      })
      .addCase(removeRepository.fulfilled, (state, action) => {
        state.repositories = state.repositories.filter((r) => r.id !== action.payload);
        if (state.activeRepository?.id === action.payload) {
          state.activeRepository = null;
        }
      })
      .addCase(refreshRepository.fulfilled, (state, action) => {
        const index = state.repositories.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.repositories[index] = action.payload;
        }
        if (state.activeRepository?.id === action.payload.id) {
          state.activeRepository = action.payload;
        }
      });
  },
});

export const { setActiveRepository, clearRepositories, clearError } = repositorySlice.actions;
export default repositorySlice.reducer;

