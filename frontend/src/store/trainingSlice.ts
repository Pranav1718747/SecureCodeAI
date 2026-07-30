/** Redux slice tracking model fine-tuning job metrics, training logs, and model artifacts. */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { trainingService } from '../services/trainingService';

export interface FineTuningJob {
  id: string;
  sagemaker_job_name: string;
  base_model: string;
  status: 'STARTING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  created_at: string;
  completed_at: string | null;
}

export interface FeedbackEvent {
  id: string;
  patch: string;
  action: 'ACCEPTED' | 'REJECTED' | 'MODIFIED';
  reviewer_notes: string;
  reviewed_by: string;
  created_at: string;
}

interface TrainingState {
  jobs: FineTuningJob[];
  activeJob: FineTuningJob | null;
  feedbackEvents: FeedbackEvent[];
  loading: boolean;
  triggering: boolean;
  error: string | null;
}

const initialState: TrainingState = {
  jobs: [],
  activeJob: null,
  feedbackEvents: [],
  loading: false,
  triggering: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'training/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await trainingService.listJobs();
      return res.data.results as FineTuningJob[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to load jobs');
    }
  }
);

export const triggerTraining = createAsyncThunk(
  'training/trigger',
  async ({ datasetId, baseModel }: { datasetId: string; baseModel: string }, { rejectWithValue }) => {
    try {
      const res = await trainingService.triggerTrainingJob(datasetId, baseModel);
      return res.data as FineTuningJob;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to trigger training');
    }
  }
);

export const fetchFeedbackEvents = createAsyncThunk(
  'training/fetchFeedback',
  async (_, { rejectWithValue }) => {
    try {
      const res = await trainingService.listFeedbackEvents();
      return res.data.results as FeedbackEvent[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to load feedback');
    }
  }
);

const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: {
    setActiveJob(state, action: PayloadAction<FineTuningJob | null>) {
      state.activeJob = action.payload;
    },
    clearTraining(state) {
      state.jobs = [];
      state.activeJob = null;
      state.feedbackEvents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(triggerTraining.pending, (state) => { state.triggering = true; })
      .addCase(triggerTraining.fulfilled, (state, action) => {
        state.triggering = false;
        state.jobs.unshift(action.payload);
      })
      .addCase(triggerTraining.rejected, (state) => { state.triggering = false; })
      .addCase(fetchFeedbackEvents.fulfilled, (state, action) => {
        state.feedbackEvents = action.payload;
      });
  },
});

export const { setActiveJob, clearTraining } = trainingSlice.actions;
export default trainingSlice.reducer;
