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
    appendVulnerabilities(state, action: PayloadAction<Vulnerability[]>) {
      const existingIds = new Set(state.vulnerabilities.map(v => v.id));
      const newVulns = action.payload.filter(v => !existingIds.has(v.id));
      if (newVulns.length > 0) {
        state.vulnerabilities = [...state.vulnerabilities, ...newVulns];
      }
    },
    updateActiveScan(state, action: PayloadAction<Partial<Scan>>) {
      if (state.activeScan) {
        state.activeScan = { ...state.activeScan, ...action.payload };
      }
      // Also update in the list if it exists
      if (action.payload.id) {
        const index = state.scans.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.scans[index] = { ...state.scans[index], ...action.payload };
        }
      }
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

export const { setActiveScan, setFilters, clearScans, appendVulnerabilities, updateActiveScan } = scanSlice.actions;
export default scanSlice.reducer;
