import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { updateActiveScan, appendVulnerabilities, fetchScanDetail, fetchVulnerabilities } from '../store/scanSlice';
import { Vulnerability } from '../types/scan';

export interface ProgressState {
  processed_files: number;
  total_files: number;
}

export interface LiveScanContextType {
  scanId: string;
  isLive: boolean;
  status: string;
  stage: string;
  progress: ProgressState;
  overallProgressPct: number;
  elapsedSeconds: number;
  etaSeconds: number;
  filesPerSecond: number;
  currentFile: string | null;
  currentFolder: string;
  currentScanner: string;
  vulnerabilities: Vulnerability[];
}

const STAGE_WEIGHTS: Record<string, number> = {
  "Cloning Repository": 5,
  "Analyzing File Tree": 10,
  "Language Detection": 10,
  "Dependency Analysis": 10,
  "AST Parsing": 15,
  "Semgrep Scan": 20,
  "Bandit Scan": 10,
  "Secret Detection": 5,
  "Building Workflow Plan": 5,
  "AI Analysis": 9,
  "Cleaning Up": 1
};

const STAGE_ORDER = Object.keys(STAGE_WEIGHTS);

const LiveScanContext = createContext<LiveScanContextType | null>(null);

export const useLiveScan = () => {
  const context = useContext(LiveScanContext);
  if (!context) throw new Error("useLiveScan must be used within LiveScanProvider");
  return context;
};

export const LiveScanProvider = ({ scanId, children }: { scanId: string, children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const scan = useSelector((state: RootState) => state.scans.activeScan);
  const vulnerabilities = useSelector((state: RootState) => state.scans.vulnerabilities);
  
  const [stage, setStage] = useState<string>("Queued");
  const [progress, setProgress] = useState<ProgressState>({ processed_files: 0, total_files: 0 });
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentScanner, setCurrentScanner] = useState<string>("Initializing...");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const isLive = scan?.status === 'IN_PROGRESS' || scan?.status === 'QUEUED';
  
  // Timer for elapsed seconds
  useEffect(() => {
    if (isLive) {
      timerRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLive]);
  
  // WebSocket Connection
  useEffect(() => {
    if (!scanId || !isLive) return;
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = '127.0.0.1:8000';
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/scans/${scanId}/`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type !== 'scan_update') return;
      const payload = message.data;
      
      if (payload.type === 'stage_update') {
        setStage(payload.stage);
        if (payload.stage === 'Building Workflow Plan' || payload.stage === 'Cleaning Up') {
            setCurrentScanner(payload.stage);
        }
      }
      
      if (payload.progress) {
        setProgress(payload.progress);
      }
      
      if (payload.scanner) {
        setCurrentScanner(payload.scanner);
        setStage(payload.scanner);
      }
      
      if (payload.file) {
        setCurrentFile(payload.file);
      }
      
      if (payload.type === 'new_vulnerability' && payload.vulnerability) {
        dispatch(appendVulnerabilities([payload.vulnerability]));
      }
      
      if (payload.type === 'batch_vulnerabilities' && payload.vulnerabilities) {
        dispatch(appendVulnerabilities(payload.vulnerabilities));
      }
      
      if (payload.status === 'COMPLETED' || payload.status === 'FAILED') {
        dispatch(updateActiveScan({ status: payload.status }));
        dispatch(fetchScanDetail(scanId));
        dispatch(fetchVulnerabilities(scanId));
      }
    };
    
    return () => ws.close();
  }, [scanId, isLive, dispatch]);

  // Calculations
  const filesPerSecond = elapsedSeconds > 0 && progress.processed_files > 0 
    ? progress.processed_files / elapsedSeconds 
    : 0;
    
  const remainingFiles = progress.total_files > 0 
    ? progress.total_files - progress.processed_files 
    : 0;
    
  const etaSeconds = filesPerSecond > 0 ? Math.round(remainingFiles / filesPerSecond) : 0;
  
  const currentFolder = currentFile 
    ? (currentFile.split('/').slice(0, -1).join('/') || '/') + '/' 
    : 'Preparing...';

  // Weighted Progress Calculation
  let overallProgressPct = 0;
  let currentStageIndex = STAGE_ORDER.indexOf(stage);
  
  if (currentStageIndex === -1 && scan?.status === 'COMPLETED') {
      overallProgressPct = 100;
  } else if (currentStageIndex !== -1) {
    for (let i = 0; i < currentStageIndex; i++) {
        overallProgressPct += STAGE_WEIGHTS[STAGE_ORDER[i]];
    }
    
    const currentWeight = STAGE_WEIGHTS[stage] || 0;
    if (progress.total_files > 0) {
        const stageProgress = (progress.processed_files / progress.total_files) * currentWeight;
        overallProgressPct += stageProgress;
    }
  }

  const value = {
    scanId,
    isLive: isLive || false,
    status: scan?.status || 'UNKNOWN',
    stage,
    progress,
    overallProgressPct: Math.min(100, overallProgressPct),
    elapsedSeconds,
    etaSeconds,
    filesPerSecond,
    currentFile,
    currentFolder,
    currentScanner,
    vulnerabilities
  };

  return <LiveScanContext.Provider value={value}>{children}</LiveScanContext.Provider>;
};
