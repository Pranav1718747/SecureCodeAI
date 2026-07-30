/** Custom hook managing active security scan status, polling, and findings data. */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import {
  fetchScans,
  createScan,
  fetchScanDetail,
  fetchVulnerabilities,
  setActiveScan,
  setFilters,
} from '../store/scanSlice';
import type { Scan } from '../types/scan';

export const useScan = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { scans, activeScan, vulnerabilities, filters, loading, scanning, error } = useSelector(
    (state: RootState) => state.scans
  );

  const loadScans = useCallback(
    (repositoryId: string) => dispatch(fetchScans(repositoryId)),
    [dispatch]
  );

  const startScan = useCallback(
    (repositoryId: string, branch: string) => dispatch(createScan({ repositoryId, branch })),
    [dispatch]
  );

  const loadScanDetail = useCallback(
    (scanId: string) => dispatch(fetchScanDetail(scanId)),
    [dispatch]
  );

  const loadVulnerabilities = useCallback(
    (scanId: string) => dispatch(fetchVulnerabilities(scanId)),
    [dispatch]
  );

  const selectScan = useCallback(
    (scan: Scan | null) => dispatch(setActiveScan(scan)),
    [dispatch]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => dispatch(setFilters(newFilters)),
    [dispatch]
  );

  // Apply filters to vulnerabilities
  const filteredVulnerabilities = vulnerabilities.filter((v) => {
    if (filters.severity && v.severity !== filters.severity) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.file_path.toLowerCase().includes(q) ||
        v.cwe_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return {
    scans,
    activeScan,
    vulnerabilities: filteredVulnerabilities,
    allVulnerabilities: vulnerabilities,
    filters,
    loading,
    scanning,
    error,
    loadScans,
    startScan,
    loadScanDetail,
    loadVulnerabilities,
    selectScan,
    updateFilters,
  };
};
