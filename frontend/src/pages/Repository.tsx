import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repositoryService } from '../services/repositoryService';
import { scanService } from '../services/scanService';
import { Repository } from '../types/repository';
import { Scan } from '../types/scan';
import { Loader2, ShieldAlert, Edit3, Trash2, Archive, Star, Play, CheckCircle2 } from 'lucide-react';

// Modular Components
import { RepositoryHeader } from '../components/repository/RepositoryHeader';
import { ActionToolbar } from '../components/repository/ActionToolbar';
import { RepositoryHealth } from '../components/repository/RepositoryHealth';
import { RepositoryMetrics } from '../components/repository/RepositoryMetrics';
import { ScanManagementToolbar } from '../components/repository/ScanManagementToolbar';
import { ScanHistoryCard } from '../components/repository/ScanHistoryCard';
import { RunningScanCard } from '../components/repository/RunningScanCard';
import { FailedScanCard } from '../components/repository/FailedScanCard';
import { ActivityTimeline, ActivityItem } from '../components/repository/ActivityTimeline';
import { EmptyState } from '../components/repository/EmptyState';
import { ErrorCard } from '../components/repository/ErrorCard';

// Management Modals & Drawers
import { DeleteScanModal } from '../components/repository/DeleteScanModal';
import { RenameScanModal } from '../components/repository/RenameScanModal';
import { ScanComparisonModal } from '../components/repository/ScanComparisonModal';
import { ScanDetailsDrawer } from '../components/repository/ScanDetailsDrawer';
import { UndoToast } from '../components/repository/UndoToast';

export const RepositoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Primary State
  const [repo, setRepo] = useState<Repository | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scan Management State
  const [selectedScanIds, setSelectedScanIds] = useState<string[]>([]);
  const [pinnedScanIds, setPinnedScanIds] = useState<string[]>([]);
  const [archivedScanIds, setArchivedScanIds] = useState<string[]>([]);
  const [deletedScanIds, setDeletedScanIds] = useState<string[]>([]);
  const [customScanNames, setCustomScanNames] = useState<Record<string, string>>({});

  // Toolbar Filters
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Toast State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; scans: Scan[] }>({
    isOpen: false,
    scans: [],
  });
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; scan: Scan | null }>({
    isOpen: false,
    scan: null,
  });
  const [comparisonModal, setComparisonModal] = useState<{ isOpen: boolean; scans: Scan[] }>({
    isOpen: false,
    scans: [],
  });
  const [detailsDrawer, setDetailsDrawer] = useState<{ isOpen: boolean; scan: Scan | null }>({
    isOpen: false,
    scan: null,
  });
  const [undoToast, setUndoToast] = useState<{
    show: boolean;
    message: string;
    deletedScanIds: string[];
  } | null>(null);

  // Activity Feed State
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (id) {
      // Reset state for repository isolation when switching repositories
      setSelectedScanIds([]);
      setPinnedScanIds([]);
      setArchivedScanIds([]);
      setDeletedScanIds([]);
      setCustomScanNames({});
      setActivityFeed([]);
      setActiveFilter('All');
      setSearchQuery('');
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const hasActiveScans = scans.some((s) => s.status === 'IN_PROGRESS' || s.status === 'QUEUED');

    if (id && hasActiveScans) {
      intervalId = setInterval(() => {
        scanService
          .getScans(id)
          .then((scansData) => {
            setScans(scansData.results);
          })
          .catch((err) => console.error('Failed to poll scans', err));
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, scans]);

  // Keyboard Shortcuts Handler (Cmd+A, Del, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes modals and clears selection
      if (e.key === 'Escape') {
        setSelectedScanIds([]);
        setDeleteModal({ isOpen: false, scans: [] });
        setRenameModal({ isOpen: false, scan: null });
        setComparisonModal({ isOpen: false, scans: [] });
        setDetailsDrawer({ isOpen: false, scan: null });
        return;
      }

      // Cmd+A / Ctrl+A selects all visible non-deleted scans
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        const inputFocused = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
        if (!inputFocused && visibleScans.length > 0) {
          e.preventDefault();
          setSelectedScanIds(visibleScans.map((s) => s.id));
        }
      }

      // Del / Backspace opens bulk delete modal for selected scans
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedScanIds.length > 0) {
        const inputFocused = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
        if (!inputFocused) {
          e.preventDefault();
          const targetScans = scans.filter((s) => selectedScanIds.includes(s.id));
          setDeleteModal({ isOpen: true, scans: targetScans });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scans, selectedScanIds]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!id) return;
      const [repoData, scansData] = await Promise.all([
        repositoryService.getRepository(id),
        scanService.getScans(id),
      ]);
      setRepo(repoData);
      setScans(scansData.results);
    } catch (err: any) {
      setError(err.message || 'Failed to load repository details');
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = (title: string, icon = ShieldAlert, color = 'text-[#18E6A8]', bg = 'bg-[#18E6A8]/10 border-[#18E6A8]/20') => {
    const newItem: ActivityItem = {
      id: String(Date.now()),
      type: 'action',
      title,
      time: 'Just now',
      icon,
      color,
      bg,
    };
    setActivityFeed((prev) => [newItem, ...prev]);
  };

  const handleTriggerScan = async () => {
    try {
      if (!id) return;
      setIsScanning(true);
      const newScan = await scanService.triggerScan(id);
      addActivity(`Triggered new security scan #${newScan.id.split('-')[0]}`, Play, 'text-blue-400', 'bg-blue-500/10 border-blue-500/20');
      navigate(`/review/${newScan.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger scan');
      setIsScanning(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (scanId: string) => {
    setSelectedScanIds((prev) =>
      prev.includes(scanId) ? prev.filter((i) => i !== scanId) : [...prev, scanId]
    );
  };

  const handleSelectAll = () => {
    if (selectedScanIds.length === visibleScans.length) {
      setSelectedScanIds([]);
    } else {
      setSelectedScanIds(visibleScans.map((s) => s.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedScanIds([]);
  };

  // Pin / Favorite handler
  const handleTogglePin = (scanId: string) => {
    const isPinned = pinnedScanIds.includes(scanId);
    setPinnedScanIds((prev) =>
      isPinned ? prev.filter((i) => i !== scanId) : [...prev, scanId]
    );
    addActivity(
      `${isPinned ? 'Unpinned' : 'Pinned'} scan #${scanId.split('-')[0]} to top`,
      Star,
      'text-[#FBBF24]',
      'bg-[#FBBF24]/10 border-[#FBBF24]/20'
    );
  };

  // Rename handler
  const handleSaveRename = (scanId: string, newName: string) => {
    setCustomScanNames((prev) => ({ ...prev, [scanId]: newName }));
    addActivity(`Renamed scan to "${newName}"`, Edit3, 'text-blue-400', 'bg-blue-500/10 border-blue-500/20');
  };

  // Archive handler
  const handleArchive = (scan: Scan) => {
    const isArchived = archivedScanIds.includes(scan.id);
    setArchivedScanIds((prev) =>
      isArchived ? prev.filter((i) => i !== scan.id) : [...prev, scan.id]
    );
    addActivity(
      `${isArchived ? 'Unarchived' : 'Archived'} scan #${scan.id.split('-')[0]}`,
      Archive,
      'text-[#94A3B8]',
      'bg-[#151E2D] border-white/[0.08]'
    );
  };

  // Delete handlers with 10s Toast Undo
  const handleConfirmDelete = () => {
    const targetIds = deleteModal.scans.map((s) => s.id);
    setDeletedScanIds((prev) => [...prev, ...targetIds]);
    setSelectedScanIds((prev) => prev.filter((id) => !targetIds.includes(id)));

    const count = targetIds.length;
    const msg = count === 1 ? `Scan #${targetIds[0].split('-')[0]} deleted` : `${count} scans deleted`;

    setUndoToast({
      show: true,
      message: msg,
      deletedScanIds: targetIds,
    });

    addActivity(msg, Trash2, 'text-[#F05B68]', 'bg-[#F05B68]/10 border-[#F05B68]/20');
    setDeleteModal({ isOpen: false, scans: [] });
  };

  const handleUndoDelete = () => {
    if (undoToast) {
      setDeletedScanIds((prev) => prev.filter((id) => !undoToast.deletedScanIds.includes(id)));
      addActivity(`Restored deleted scan(s)`, CheckCircle2, 'text-[#18E6A8]', 'bg-[#18E6A8]/10 border-[#18E6A8]/20');
      setUndoToast(null);
    }
  };

  // Export handler
  const handleExport = (scan: Scan, format: 'PDF' | 'JSON' | 'CSV' | 'SARIF') => {
    const dataStr = JSON.stringify(scan, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan-${scan.id.split('-')[0]}-report.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addActivity(`Exported scan #${scan.id.split('-')[0]} as ${format}`, ShieldAlert, 'text-[#18E6A8]', 'bg-[#18E6A8]/10 border-[#18E6A8]/20');
  };

  // Compare handler
  const handleCompare = () => {
    const selectedScans = scans.filter((s) => selectedScanIds.includes(s.id));
    if (selectedScans.length === 2) {
      setComparisonModal({ isOpen: true, scans: selectedScans });
      addActivity(`Comparing Scan #${selectedScans[0].id.split('-')[0]} vs #${selectedScans[1].id.split('-')[0]}`, ShieldAlert, 'text-blue-400', 'bg-blue-500/10 border-blue-500/20');
    }
  };

  // Process & Filter Scans
  const visibleScans = useMemo(() => {
    return scans
      .filter((s) => !deletedScanIds.includes(s.id))
      .filter((s) => !id || String(s.repository) === String(id))
      .map((s) => ({
        ...s,
        custom_name: customScanNames[s.id] || s.custom_name,
        is_pinned: pinnedScanIds.includes(s.id),
        is_archived: archivedScanIds.includes(s.id),
        status: archivedScanIds.includes(s.id) ? ('ARCHIVED' as const) : s.status,
      }))
      .filter((s) => {
        // Tab Filter
        if (activeFilter === 'Completed') return s.status === 'COMPLETED';
        if (activeFilter === 'Running') return s.status === 'IN_PROGRESS' || s.status === 'QUEUED';
        if (activeFilter === 'Failed') return s.status === 'FAILED';
        if (activeFilter === 'Archived') return s.status === 'ARCHIVED';
        return s.status !== 'ARCHIVED'; // 'All' hides archived
      })
      .filter((s) => {
        // Search Filter
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.id.toLowerCase().includes(q) ||
          s.branch_name.toLowerCase().includes(q) ||
          (s.custom_name && s.custom_name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Pinned scans stay at top
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [scans, deletedScanIds, customScanNames, pinnedScanIds, archivedScanIds, activeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B16] flex flex-col items-center justify-center gap-4 text-center font-sans">
        <div className="relative">
          <div className="absolute inset-0 bg-[#18E6A8] blur-xl opacity-20 rounded-full" />
          <Loader2 className="h-10 w-10 text-[#18E6A8] animate-spin relative z-10" />
        </div>
        <p className="text-[#94A3B8] font-medium text-sm animate-pulse font-mono">
          Loading workspace telemetry...
        </p>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="min-h-screen bg-[#070B16] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <ErrorCard error={error || 'Repository not found'} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  const totalVulnerabilities = scans.reduce(
    (acc, scan) => acc + (scan.total_vulnerabilities || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#070B16] text-[#F8FAFC] font-sans antialiased selection:bg-[#18E6A8]/20 selection:text-[#18E6A8]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        {/* Section 1: Repository Header */}
        <RepositoryHeader repo={repo} />

        {/* Section 2: Security Health & Scanning Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <RepositoryHealth scans={scans} />
          </div>
          <div className="lg:col-span-1">
            <ActionToolbar onScan={handleTriggerScan} isScanning={isScanning} />
          </div>
        </div>

        {/* Section 3: Repository Metrics */}
        <RepositoryMetrics
          totalScans={scans.length}
          totalVulnerabilities={totalVulnerabilities}
        />

        {/* Section 4 & 5: Scan Management Toolbar & History List */}
        <div className="space-y-6 pt-4 border-t border-white/[0.08]">
          <ScanManagementToolbar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedScanIds={selectedScanIds}
            totalScansCount={visibleScans.length}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onNewScan={handleTriggerScan}
            onBulkDelete={() => {
              const targetScans = scans.filter((s) => selectedScanIds.includes(s.id));
              setDeleteModal({ isOpen: true, scans: targetScans });
            }}
            onBulkArchive={() => {
              setArchivedScanIds((prev) => [...prev, ...selectedScanIds]);
              setSelectedScanIds([]);
              addActivity(`Archived ${selectedScanIds.length} scans`, Archive, 'text-[#94A3B8]', 'bg-[#151E2D] border-white/[0.08]');
            }}
            onBulkExport={(format) => {
              selectedScanIds.forEach((id) => {
                const s = scans.find((item) => item.id === id);
                if (s) handleExport(s, format);
              });
            }}
            onCompare={handleCompare}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Scan Cards List */}
            <div className="lg:col-span-3 space-y-4">
              {visibleScans.length === 0 ? (
                <EmptyState onScan={handleTriggerScan} isScanning={isScanning} />
              ) : (
                <div className="space-y-4">
                  {visibleScans.map((scan) => {
                    const isSelected = selectedScanIds.includes(scan.id);

                    if (scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED') {
                      return (
                        <RunningScanCard
                          key={scan.id}
                          scan={scan}
                          onStop={() => addActivity(`Stopped scan #${scan.id.split('-')[0]}`, Trash2, 'text-[#F05B68]')}
                          onPause={() => addActivity(`Paused scan #${scan.id.split('-')[0]}`, ShieldAlert, 'text-[#FBBF24]')}
                          onRestart={() => addActivity(`Restarted scan #${scan.id.split('-')[0]}`, Play, 'text-blue-400')}
                        />
                      );
                    }

                    if (scan.status === 'FAILED') {
                      return (
                        <FailedScanCard
                          key={scan.id}
                          scan={scan}
                          onRetry={handleTriggerScan}
                          onViewLogs={(s) => setDetailsDrawer({ isOpen: true, scan: s })}
                          onDownloadLogs={(s) => handleExport(s, 'JSON')}
                        />
                      );
                    }

                    return (
                      <ScanHistoryCard
                        key={scan.id}
                        scan={scan}
                        isSelected={isSelected}
                        onToggleSelect={handleToggleSelect}
                        onTogglePin={handleTogglePin}
                        onRename={(s) => setRenameModal({ isOpen: true, scan: s })}
                        onArchive={handleArchive}
                        onDelete={(s) => setDeleteModal({ isOpen: true, scans: [s] })}
                        onOpenDetails={(s) => setDetailsDrawer({ isOpen: true, scan: s })}
                        onExport={handleExport}
                        onDuplicate={(s) => {
                          addActivity(`Duplicated scan #${s.id.split('-')[0]}`, Play, 'text-blue-400');
                          handleTriggerScan();
                        }}
                        onCompare={(s: Scan) => {
                          const other = scans.find((item) => item.id !== s.id);
                          if (other) setComparisonModal({ isOpen: true, scans: [s, other] });
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Activity Timeline Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <ActivityTimeline customActivities={activityFeed} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals, Drawers & Toast */}
      <DeleteScanModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, scans: [] })}
        onConfirm={handleConfirmDelete}
        scansToDelete={deleteModal.scans}
        repoName={repo.name}
      />

      <RenameScanModal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal({ isOpen: false, scan: null })}
        onSave={handleSaveRename}
        scan={renameModal.scan}
      />

      <ScanComparisonModal
        isOpen={comparisonModal.isOpen}
        onClose={() => setComparisonModal({ isOpen: false, scans: [] })}
        scans={comparisonModal.scans}
      />

      <ScanDetailsDrawer
        isOpen={detailsDrawer.isOpen}
        onClose={() => setDetailsDrawer({ isOpen: false, scan: null })}
        scan={detailsDrawer.scan}
      />

      {undoToast && undoToast.show && (
        <UndoToast
          message={undoToast.message}
          onUndo={handleUndoDelete}
          onDismiss={() => setUndoToast(null)}
        />
      )}
    </div>
  );
};
