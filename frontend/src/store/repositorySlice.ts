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
        state.repositories.unshift(action.payload);
      });
  },
});

export const { setActiveRepository, clearRepositories, clearError } = repositorySlice.actions;
export default repositorySlice.reducer;
