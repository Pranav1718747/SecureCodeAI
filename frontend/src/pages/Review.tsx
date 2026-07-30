import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchScanDetail, fetchVulnerabilities } from '../store/scanSlice';
import { scanService } from '../services/scanService';
import { patchService } from '../services/patchService';
import { Vulnerability, Patch } from '../types/scan';
import { Loader2, ShieldAlert } from 'lucide-react';
import { LiveScanProvider } from '../contexts/LiveScanContext';
import { LiveScanDashboard } from './LiveScanDashboard';

// New Review Components
import { ReviewHeader } from '../components/review/ReviewHeader';
import { MetricsBar } from '../components/review/MetricsBar';
import { VulnerabilitySidebar } from '../components/review/VulnerabilitySidebar';
import { DetailPanel } from '../components/review/DetailPanel';

export const ReviewPage = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const scan = useSelector((state: RootState) => state.scans.activeScan);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (scanId) {
      if (scan && scan.id === scanId) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      
      Promise.all([
        dispatch(fetchScanDetail(scanId)),
        dispatch(fetchVulnerabilities(scanId))
      ]).finally(() => setIsLoading(false));
    }
  }, [scanId, dispatch]);

  if (isLoading && !scan) {
    return (
      <div className="flex justify-center h-screen items-center bg-[#0B1120]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading scan data...</p>
        </div>
      </div>
    );
  }

  if (!scan) return <div className="p-8 text-center text-slate-400">Scan not found</div>;

  const isLive = scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED';

  if (isLive && scanId) {
    return (
      <LiveScanProvider scanId={scanId}>
        <LiveScanDashboard />
      </LiveScanProvider>
    );
  }

  return <CompletedReview scanId={scanId!} />;
};

const CompletedReview = ({ scanId }: { scanId: string }) => {
  const scan = useSelector((state: RootState) => state.scans.activeScan);
  const vulnerabilities = useSelector((state: RootState) => state.scans.vulnerabilities);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [patches, setPatches] = useState<Record<string, Patch>>({});
  const [isPatching, setIsPatching] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (scan?.status === 'COMPLETED' || scan?.status === 'FAILED') {
      scanService.getVulnerabilities(scanId).then(vulnsData => {
        if (vulnsData.results.length > 0) {
          setSelectedVuln(prev => prev || vulnsData.results[0]);
          patchService.getPatches().then(patchesData => {
            const patchesMap: Record<string, Patch> = {};
            patchesData.results.forEach(p => {
              patchesMap[p.vulnerability] = p;
            });
            setPatches(patchesMap);
          });
        }
      });
    }
  }, [scanId, scan?.status]);

  const handleGeneratePatch = async (vulnId: string) => {
    try {
      setIsPatching(prev => ({ ...prev, [vulnId]: true }));
      await patchService.generatePatch(vulnId);
      // Mock delay for UX
      setTimeout(() => {
        patchService.getPatches().then(patchesData => {
            const patchesMap: Record<string, Patch> = {};
            patchesData.results.forEach(p => {
              patchesMap[p.vulnerability] = p;
            });
            setPatches(patchesMap);
        });
        setIsPatching(prev => ({ ...prev, [vulnId]: false }));
      }, 3000);
    } catch (err) {
      alert('Failed to generate patch');
      setIsPatching(prev => ({ ...prev, [vulnId]: false }));
    }
  };

  if (!scan) return null;

  // Calculate metrics
  const counts = {
    critical: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
    high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
    medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
    low: vulnerabilities.filter(v => v.severity === 'LOW').length,
    info: 0
  };

  let durationSecs = 0;
  if (scan.started_at && scan.completed_at) {
    durationSecs = (new Date(scan.completed_at).getTime() - new Date(scan.started_at).getTime()) / 1000;
  }

  // Extract repo name safely
  let repoName = 'Repository';
  try {
    // Assuming repository field has the URL or name somewhere else, falling back
    repoName = scan.repository; 
  } catch(e) {}

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-[#0a0f1c]">
      <ReviewHeader scan={scan} repositoryName={repoName} />
      
      <div className="flex-1 flex flex-col min-h-0 p-4 md:p-6 gap-6 overflow-hidden">
        
        {/* Metrics Row */}
        <div className="shrink-0">
          <MetricsBar 
            counts={counts} 
            totalFiles={452} // Mocked until API supports it
            scanDurationSeconds={durationSecs || 145} // Fallback mock
          />
        </div>

        {scan.status === 'FAILED' && scan.error_message && (
          <div className="shrink-0 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-mono text-sm whitespace-pre-wrap">
            {scan.error_message}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex gap-6 min-h-0">
          <VulnerabilitySidebar 
            vulnerabilities={vulnerabilities}
            patches={patches}
            selectedVulnId={selectedVuln?.id || null}
            onSelect={setSelectedVuln}
          />
          
          {selectedVuln ? (
            <DetailPanel 
              vuln={selectedVuln}
              patch={patches[selectedVuln.id]}
              isGeneratingPatch={!!isPatching[selectedVuln.id]}
              onGeneratePatch={handleGeneratePatch}
            />
          ) : (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-500">
                <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium text-slate-400">No vulnerability selected</p>
                <p className="text-sm mt-1">Select an item from the sidebar to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
