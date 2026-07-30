import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchScanDetail, fetchVulnerabilities } from '../store/scanSlice';
import { scanService } from '../services/scanService';
import { patchService } from '../services/patchService';
import { Vulnerability, Patch } from '../types/scan';
import { Loader2, AlertCircle } from 'lucide-react';
import { LiveScanProvider } from '../contexts/LiveScanContext';
import { LiveScanDashboard } from './LiveScanDashboard';

// Workspace Components
import { VulnerabilityExplorer } from '../components/workspace/VulnerabilityExplorer';
import { StickyActionBar } from '../components/workspace/StickyActionBar';
import { WorkspaceTabs, TabType } from '../components/workspace/tabs/WorkspaceTabs';
import { AIAnalysisTab } from '../components/workspace/tabs/AIAnalysisTab';
import { VulnerableCodeTab } from '../components/workspace/tabs/VulnerableCodeTab';
import { AIPatchTab } from '../components/workspace/tabs/AIPatchTab';
import { ValidationTab } from '../components/workspace/tabs/ValidationTab';
import { PullRequestTab } from '../components/workspace/tabs/PullRequestTab';

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
      <div className="flex justify-center h-screen items-center bg-[#0a0f1c]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex justify-center h-screen items-center bg-[#0a0f1c]">
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-4 py-3 rounded-lg border border-rose-500/20">
          <AlertCircle className="h-5 w-5" />
          Scan not found
        </div>
      </div>
    );
  }

  const isLive = scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED';

  if (isLive && scanId) {
    return (
      <LiveScanProvider scanId={scanId}>
        <LiveScanDashboard />
      </LiveScanProvider>
    );
  }

  return <WorkspaceLayout scanId={scanId!} />;
};

const WorkspaceLayout = ({ scanId }: { scanId: string }) => {
  const scan = useSelector((state: RootState) => state.scans.activeScan);
  const vulnerabilities = useSelector((state: RootState) => state.scans.vulnerabilities);
  
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [patches, setPatches] = useState<Record<string, Patch>>({});
  const [activeTab, setActiveTab] = useState<TabType>('analysis');

  const [isGeneratingPatch, setIsGeneratingPatch] = useState(false);
  const [generationError, setGenerationError] = useState<any | null>(null);

  // PR generation state
  const [isCreatingPR, setIsCreatingPR] = useState(false);

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

  if (!scan) return null;

  const repoId = scan.repository || 'unknown';
  const patch = selectedVuln ? patches[selectedVuln.id] : null;
  const prData = patch?.pr_preview_data || (patch?.status === 'PR_PREVIEW' && patch?.ai_response_json);

  const handleGeneratePatch = async () => {
    if (!selectedVuln) return;
    setIsGeneratingPatch(true);
    setGenerationError(null);
    setActiveTab('patch'); // Switch to patch tab to show loading

    try {
      const generatedPatch = await patchService.generatePatch(selectedVuln.id);
      setPatches(prev => ({
        ...prev,
        [selectedVuln.id]: generatedPatch
      }));
    } catch (err: any) {
      setGenerationError(err.response?.data?.error || err.message || 'Network error while generating patch');
    } finally {
      setIsGeneratingPatch(false);
    }
  };

  const handleCreatePR = async () => {
    if (!patch) return;
    setIsCreatingPR(true);
    setGenerationError(null);
    try {
      const previewData = await patchService.createPRPreview(patch.id);
      setPatches(prev => ({
        ...prev,
        [patch.vulnerability]: {
          ...patch,
          status: 'PR_OPENED',
          pr_preview_data: previewData,
          pr_url: previewData.pr_url,
          pr_number: previewData.pr_number
        }
      }));
      setIsCreatingPR(false);
      setActiveTab('pr');
    } catch (err: any) {
      setIsCreatingPR(false);
      setGenerationError(err.response?.data || err.message || 'Failed to create Pull Request');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] bg-[#0a0f1c] overflow-hidden">
      <StickyActionBar 
        scanId={scanId} 
        repoId={repoId} 
        hasPatch={!!patch}
        isGeneratingPatch={isGeneratingPatch}
        onGeneratePatch={handleGeneratePatch}
      />
      
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT PANEL - Vulnerability Explorer (25%) */}
        <div className="w-[320px] lg:w-[400px] shrink-0 border-r border-slate-800 flex flex-col z-20">
          <VulnerabilityExplorer 
            vulnerabilities={vulnerabilities}
            patches={patches}
            selectedVulnId={selectedVuln?.id || null}
            onSelect={(vuln) => {
              setSelectedVuln(vuln);
              setActiveTab('analysis');
              setGenerationError(null); // Clear errors when switching
            }}
          />
        </div>
        
        {/* RIGHT PANEL - Investigation Workspace (75%) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117] relative">
          {selectedVuln ? (
            <>
              <WorkspaceTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                hasPatch={!!patch}
                hasPR={!!prData}
              />
              
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'analysis' && <AIAnalysisTab vuln={selectedVuln} />}
                {activeTab === 'code' && <VulnerableCodeTab vuln={selectedVuln} />}
                {activeTab === 'patch' && (
                  <AIPatchTab 
                    patch={patch} 
                    isGenerating={isGeneratingPatch}
                    onGenerate={handleGeneratePatch}
                    error={generationError}
                    isCreatingPR={isCreatingPR}
                    onCreatePR={handleCreatePR}
                  />
                )}
                {activeTab === 'validation' && patch && <ValidationTab vuln={selectedVuln} patch={patch} />}
                {activeTab === 'pr' && prData && <PullRequestTab prData={prData} />}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium text-slate-400">No vulnerability selected</p>
                <p className="text-sm mt-1">Select an item from the explorer to begin investigation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
