import { useLiveScan } from '../contexts/LiveScanContext';
import { AnimatedProgressBar } from '../components/scan/AnimatedProgressBar';
import { StageTimeline } from '../components/scan/StageTimeline';
import { LiveMetrics } from '../components/scan/LiveMetrics';
import { CurrentFileCard } from '../components/scan/CurrentFileCard';
import { LiveFindingFeed } from '../components/scan/LiveFindingFeed';
import { ProgressHeader } from '../components/scan/ProgressHeader';

export const LiveScanDashboard = () => {
  const { 
    overallProgressPct, 
    stage, 
    status,
    elapsedSeconds, 
    etaSeconds, 
    filesPerSecond, 
    currentFile, 
    currentFolder,
    currentScanner,
    vulnerabilities 
  } = useLiveScan();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <ProgressHeader />
      
      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Overall Progress</h2>
            <p className="text-sm text-slate-400">
              {status === 'FAILED' ? 'Scan Failed' : currentScanner}
            </p>
          </div>
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            {Math.round(overallProgressPct)}%
          </div>
        </div>
        <AnimatedProgressBar percentage={overallProgressPct} />
      </div>

      <div className="mb-8">
        <LiveMetrics 
          elapsedSeconds={elapsedSeconds}
          etaSeconds={etaSeconds}
          filesPerSecond={filesPerSecond}
          vulnerabilityCount={vulnerabilities.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <CurrentFileCard 
            currentFolder={currentFolder} 
            currentFile={currentFile} 
          />
          <div className="flex-1">
            <LiveFindingFeed vulnerabilities={vulnerabilities} />
          </div>
        </div>
        <div className="lg:col-span-1 h-[500px]">
          <StageTimeline currentStage={stage} status={status} />
        </div>
      </div>
    </div>
  );
};
