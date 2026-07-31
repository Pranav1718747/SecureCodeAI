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
    <div className="max-w-[1600px] mx-auto px-8 pt-8 pb-12 space-y-8 animate-in fade-in duration-500">
      <ProgressHeader />
      
      <div className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-lg font-semibold text-[#F8FAFC]">Overall Scan Progress</h2>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              {status === 'FAILED' ? 'Scan Failed' : currentScanner}
            </p>
          </div>
          <div className="text-3xl font-bold font-mono text-[#10B981]">
            {Math.round(overallProgressPct)}%
          </div>
        </div>
        <AnimatedProgressBar percentage={overallProgressPct} />
      </div>

      <div>
        <LiveMetrics 
          elapsedSeconds={elapsedSeconds}
          etaSeconds={etaSeconds}
          filesPerSecond={filesPerSecond}
          vulnerabilityCount={vulnerabilities.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
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
