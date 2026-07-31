import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repositoryService } from '../services/repositoryService';
import { scanService } from '../services/scanService';
import { Repository } from '../types/repository';
import { Scan } from '../types/scan';
import { Loader2 } from 'lucide-react';

// New Modular Components
import { RepositoryHeader } from '../components/repository/RepositoryHeader';
import { ActionToolbar } from '../components/repository/ActionToolbar';
import { RepositoryHealth } from '../components/repository/RepositoryHealth';
import { RepositoryMetrics } from '../components/repository/RepositoryMetrics';
import { FilterToolbar } from '../components/repository/FilterToolbar';
import { ScanHistoryCard } from '../components/repository/ScanHistoryCard';
import { RunningScanCard } from '../components/repository/RunningScanCard';
import { ActivityTimeline } from '../components/repository/ActivityTimeline';
import { EmptyState } from '../components/repository/EmptyState';
import { ErrorCard } from '../components/repository/ErrorCard';

export const RepositoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const hasActiveScans = scans.some(s => s.status === 'IN_PROGRESS' || s.status === 'QUEUED');
    
    if (id && hasActiveScans) {
      intervalId = setInterval(() => {
        scanService.getScans(id).then(scansData => {
          setScans(scansData.results);
        }).catch(err => console.error('Failed to poll scans', err));
      }, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, scans]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!id) return;
      const [repoData, scansData] = await Promise.all([
        repositoryService.getRepository(id),
        scanService.getScans(id)
      ]);
      setRepo(repoData);
      setScans(scansData.results);
    } catch (err: any) {
      setError(err.message || 'Failed to load repository details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerScan = async () => {
    try {
      if (!id) return;
      setIsScanning(true);
      const newScan = await scanService.triggerScan(id);
      navigate(`/review/${newScan.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger scan');
      setIsScanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#10B981] blur-xl opacity-20 rounded-full" />
          <Loader2 className="h-10 w-10 text-[#10B981] animate-spin relative z-10" />
        </div>
        <p className="text-[#94A3B8] font-medium text-sm animate-pulse font-mono">Loading workspace telemetry...</p>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <ErrorCard error={error || 'Repository not found'} onRetry={fetchData} />
      </div>
    );
  }

  const totalVulnerabilities = scans.reduce((acc, scan) => acc + (scan.total_vulnerabilities || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto px-8 pt-8 pb-12 space-y-8 animate-in fade-in duration-500">
      <RepositoryHeader repo={repo} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RepositoryHealth scans={scans} />
        </div>
        <div className="lg:col-span-1">
          <ActionToolbar onScan={handleTriggerScan} isScanning={isScanning} />
        </div>
      </div>

      <RepositoryMetrics totalScans={scans.length} totalVulnerabilities={totalVulnerabilities} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6 border-t border-white/[0.06] mt-8">
        {/* Main Content Area (History) */}
        <div className="lg:col-span-3 space-y-6">
          <FilterToolbar />
          
          {scans.length === 0 ? (
            <EmptyState onScan={handleTriggerScan} isScanning={isScanning} />
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => {
                if (scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED') {
                  return <RunningScanCard key={scan.id} scan={scan} />;
                }
                return <ScanHistoryCard key={scan.id} scan={scan} />;
              })}
            </div>
          )}
        </div>

        {/* Sidebar Activity Timeline */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </div>
  );
};
