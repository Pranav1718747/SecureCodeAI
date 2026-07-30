/** Redux slice tracking active security scan jobs, vulnerability findings list, and filters. */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Scan, Vulnerability } from '../types/scan';
import { scanService } from '../services/scanService';

interface ScanFilters {
  severity: string | null;
  search: string;
}

interface ScanState {
  scans: Scan[];
  activeScan: Scan | null;
  vulnerabilities: Vulnerability[];
  filters: ScanFilters;
  loading: boolean;
  scanning: boolean;
  error: string | null;
}

const initialState: ScanState = {
  scans: [],
  activeScan: null,
  vulnerabilities: [],
  filters: { severity: null, search: '' },
  loading: false,
  scanning: false,
  error: null,
};

export const fetchScans = createAsyncThunk(
  'scans/fetchAll',
  async (repositoryId: string, { rejectWithValue }) => {
    try {
      const data = await scanService.getScans(repositoryId);
      return data.results;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to load scans');
    }
  }
);

export const createScan = createAsyncThunk(
  'scans/create',
  async ({ repositoryId, branch }: { repositoryId: string; branch: string }, { rejectWithValue }) => {
    try {
      return await scanService.triggerScan(repositoryId, branch);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to start scan');
    }
  }
);

export const fetchScanDetail = createAsyncThunk(
  'scans/fetchDetail',
  async (scanId: string, { rejectWithValue }) => {
    try {
      return await scanService.getScan(scanId);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to load scan');
    }
  }
);

export const fetchVulnerabilities = createAsyncThunk(
  'scans/fetchVulnerabilities',
  async (scanId: string, { rejectWithValue }) => {
    try {
      const data = await scanService.getVulnerabilities(scanId);
      return data.results;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      return rejectWithValue(error.response?.data?.detail || 'Failed to load vulnerabilities');
    }
  }
);

const scanSlice = createSlice({
  name: 'scans',
  initialState,
  reducers: {
    setActiveScan(state, action: PayloadAction<Scan | null>) {
      state.activeScan = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<ScanFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearScans(state) {
      state.scans = [];
      state.activeScan = null;
      state.vulnerabilities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScans.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchScans.fulfilled, (state, action) => {
        state.loading = false;
        state.scans = action.payload;
      })
      .addCase(fetchScans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createScan.pending, (state) => { state.scanning = true; })
      .addCase(createScan.fulfilled, (state, action) => {
        state.scanning = false;
        state.scans.unshift(action.payload);
      })
      .addCase(createScan.rejected, (state) => { state.scanning = false; })
      .addCase(fetchScanDetail.fulfilled, (state, action) => {
        state.activeScan = action.payload;
      })
      .addCase(fetchVulnerabilities.fulfilled, (state, action) => {
        state.vulnerabilities = action.payload;
      });
  },
});

export const { setActiveScan, setFilters, clearScans } = scanSlice.actions;
export default scanSlice.reducer;
