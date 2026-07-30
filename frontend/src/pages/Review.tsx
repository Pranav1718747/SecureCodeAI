import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchScanDetail, fetchVulnerabilities, updateActiveScan, appendVulnerabilities } from '../store/scanSlice';
import { scanService } from '../services/scanService';
import { patchService } from '../services/patchService';
import { Vulnerability, Patch } from '../types/scan';
import { ShieldAlert, ArrowLeft, Loader2, AlertCircle, Wand2, CheckCircle2, Clock, Folder, File, Activity, Zap, Search } from 'lucide-react';
import { clsx } from 'clsx';

export const ReviewPage = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Use Redux store as single source of truth
  const scan = useSelector((state: RootState) => state.scans.activeScan);
  const vulnerabilities = useSelector((state: RootState) => state.scans.vulnerabilities);
  
  const [patches, setPatches] = useState<Record<string, Patch>>({});
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatching, setIsPatching] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState({ processed_files: 0, total_files: 0 });
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scanId) {
      // If we already have the scan in Redux, render instantly and don't block UI with loading spinner
      if (scan && scan.id === scanId) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      
      // Fetch fresh data in the background silently
      fetchData();
    }
  }, [scanId]);

  useEffect(() => {
    if (scan && (scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED')) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scan?.status]);

  useEffect(() => {
    if (!scanId || !scan || (scan.status !== 'IN_PROGRESS' && scan.status !== 'QUEUED')) {
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/scans/${scanId}/`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'scan_update') {
        const payload = message.data;
        
        if (payload.progress) {
          setProgress(payload.progress);
        }
        
        if (payload.file) {
          setCurrentFile(payload.file);
        }
        
        if (payload.type === 'new_vulnerability' && payload.vulnerability) {
          dispatch(appendVulnerabilities([payload.vulnerability]));
          
          setSelectedVuln(prev => {
            if (!prev) return payload.vulnerability;
            return prev;
          });
        }
        
        // Handle batch vulnerability updates (optimized pipeline)
        if (payload.type === 'batch_vulnerabilities' && payload.vulnerabilities) {
          dispatch(appendVulnerabilities(payload.vulnerabilities));
          
          setSelectedVuln(prev => {
            if (!prev && payload.vulnerabilities.length > 0) return payload.vulnerabilities[0];
            return prev;
          });
        }
        
        // Handle scan completion
        if (payload.status === 'COMPLETED' || payload.status === 'FAILED') {
          // Instantly update Redux so the UI transitions from Live Dashboard to Completed Review
          dispatch(updateActiveScan({ status: payload.status }));
          // Fetch the final comprehensive state silently
          fetchData(); 
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [scanId, scan?.status, dispatch]);

  const fetchData = async () => {
    try {
      if (!scanId) return;
      
      // We rely on Redux thunks to populate the shared state cache
      await Promise.all([
        dispatch(fetchScanDetail(scanId)),
        dispatch(fetchVulnerabilities(scanId))
      ]);
      
      // Local state specific to this view
      const vulnsData = await scanService.getVulnerabilities(scanId);
      if (vulnsData.results.length > 0) {
        setSelectedVuln(prev => prev || vulnsData.results[0]);
        const patchesData = await patchService.getPatches();
        const patchesMap: Record<string, Patch> = {};
        patchesData.results.forEach(p => {
          patchesMap[p.vulnerability] = p;
        });
        setPatches(patchesMap);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePatch = async (vulnId: string) => {
    try {
      setIsPatching(prev => ({ ...prev, [vulnId]: true }));
      await patchService.generatePatch(vulnId);
      setTimeout(() => {
        fetchData();
        setIsPatching(prev => ({ ...prev, [vulnId]: false }));
      }, 5000);
    } catch (err) {
      alert('Failed to generate patch');
      setIsPatching(prev => ({ ...prev, [vulnId]: false }));
    }
  };

  if (isLoading && !scan) {
    return <div className="flex justify-center h-64 items-center"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>;
  }

  if (!scan) return <div className="p-8 text-center text-slate-400">Scan not found</div>;

  const isLive = scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED';
  
  // Calculate Progress metrics
  const progressPct = progress.total_files > 0 ? (progress.processed_files / progress.total_files) * 100 : 0;
  
  // Calculate ETA
  let etaSeconds = 0;
  if (progress.processed_files > 0 && elapsedSeconds > 0) {
    const filesPerSecond = progress.processed_files / elapsedSeconds;
    const remainingFiles = progress.total_files - progress.processed_files;
    etaSeconds = Math.round(remainingFiles / filesPerSecond);
  }

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return "--";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };
  
  // Parse current file
  let currentFolder = "Preparing...";
  let currentFileName = "Waiting...";
  let currentPhase = scan.status === 'QUEUED' ? 'Queued for processing' : 'Analyzing Repository Structure';
  
  if (currentFile) {
    const parts = currentFile.split('/');
    currentFileName = parts.pop() || '';
    currentFolder = parts.length > 0 ? parts.join('/') + '/' : '/';
    currentPhase = 'Checking for Vulnerabilities';
  }

  if (isLive) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/repository/${scan.repository}`} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Live Scan Dashboard
              <span className="flex h-3 w-3 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </h1>
            <p className="text-sm text-slate-400">Streaming real-time analysis updates</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Progress Widget */}
          <div className="col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Scanning Progress</h3>
                <div className="text-3xl font-bold text-white">{progressPct.toFixed(0)}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400 mb-1">Files Processed</div>
                <div className="text-xl font-semibold text-slate-200">
                  {progress.processed_files} / {progress.total_files || '--'}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden relative">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${Math.max(2, progressPct)}%` }}
              >
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex items-start gap-3">
                <Folder className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Current Folder</div>
                  <div className="text-sm text-slate-300 truncate" title={currentFolder}>{currentFolder}</div>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex items-start gap-3">
                <File className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Current File</div>
                  <div className="text-sm text-slate-300 truncate" title={currentFileName}>{currentFileName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Widget */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Current Stage
              </h3>
              <div className="text-lg font-medium text-blue-400 mb-6">{currentPhase}</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Elapsed Time
                </span>
                <span className="text-white font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Est. Remaining
                </span>
                <span className="text-white font-mono">{progress.processed_files > 0 ? formatTime(etaSeconds) : "Calculating..."}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Vulnerability Stream */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              Live Findings Stream
            </h2>
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm font-medium">
              {vulnerabilities.length} Vulnerabilities Detected
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {vulnerabilities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Search className="h-10 w-10 mb-3 opacity-20 animate-pulse" />
                <p>Scanning code... Any findings will appear here instantly.</p>
              </div>
            ) : (
              [...vulnerabilities].reverse().map(vuln => (
                <div key={vuln.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        vuln.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-400' :
                        vuln.severity === 'HIGH' ? 'bg-orange-900/50 text-orange-400' :
                        vuln.severity === 'MEDIUM' ? 'bg-amber-900/50 text-amber-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {vuln.severity}
                      </span>
                      <h3 className="font-medium text-slate-200 text-sm">{vuln.title}</h3>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> CWE-{vuln.cwe_id}
                    </span>
                  </div>
                  <div className="text-xs text-blue-400 font-mono bg-blue-900/10 px-2 py-1 rounded inline-block">
                    {vuln.file_path}:{vuln.line_start}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Completed/Failed Review Mode (Original UI)
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/repository/${scan.repository}`} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Scan Review
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              scan.status === 'COMPLETED' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
            }`}>
              {scan.status}
            </span>
          </h1>
          <p className="text-sm text-slate-400">Found {vulnerabilities.length} vulnerabilities on branch {scan.branch_name}</p>
        </div>
      </div>

      {scan.status === 'FAILED' && scan.error_message && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-mono text-sm whitespace-pre-wrap">
          {scan.error_message}
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Vulnerabilities</h2>
          </div>
          <div className="divide-y divide-slate-800/50 flex-1 overflow-y-auto">
            {vulnerabilities.map(vuln => (
              <button
                key={vuln.id}
                onClick={() => setSelectedVuln(vuln)}
                className={clsx(
                  "w-full text-left p-4 hover:bg-slate-800/50 transition-colors",
                  selectedVuln?.id === vuln.id ? "bg-slate-800/80 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    vuln.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-400' :
                    vuln.severity === 'HIGH' ? 'bg-orange-900/50 text-orange-400' :
                    vuln.severity === 'MEDIUM' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {vuln.severity}
                  </span>
                  {patches[vuln.id] && <span title="Patch Available"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></span>}
                </div>
                <h3 className="font-medium text-slate-200 text-sm mb-1">{vuln.title}</h3>
                <p className="text-xs text-slate-500 truncate">{vuln.file_path}:{vuln.line_start}</p>
              </button>
            ))}
            {vulnerabilities.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No vulnerabilities found!</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {selectedVuln ? (
            <>
              <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{selectedVuln.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      CWE-{selectedVuln.cwe_id}
                    </span>
                    <span>{selectedVuln.file_path}:{selectedVuln.line_start}</span>
                  </div>
                </div>
                {!patches[selectedVuln.id] && (
                  <button
                    onClick={() => handleGeneratePatch(selectedVuln.id)}
                    disabled={isPatching[selectedVuln.id]}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isPatching[selectedVuln.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Generate Patch
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                  <div className="text-slate-300 text-sm whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-slate-800">
                    {selectedVuln.description}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Vulnerable Code snippet</h3>
                  <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                    <code className="text-sm text-red-400">{selectedVuln.snippet}</code>
                  </pre>
                </div>

                {patches[selectedVuln.id] && (
                  <div className="mt-8 pt-8 border-t border-slate-800">
                    <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      AI Generated Patch
                    </h3>
                    <div className="mb-4 text-slate-300 text-sm bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/50">
                      {patches[selectedVuln.id].explanation}
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-lg border border-emerald-900/50 overflow-x-auto">
                      <code className="text-sm text-emerald-400">{patches[selectedVuln.id].diff_content}</code>
                    </pre>
                    <div className="mt-4 flex justify-end gap-3">
                      <button className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium transition-colors">
                        Reject Patch
                      </button>
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium transition-colors">
                        Apply to Repository
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a vulnerability to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
