import React from 'react';
import { useLiveScan } from '../contexts/LiveScanContext';
import { AnimatedProgressBar } from '../components/scan/AnimatedProgressBar';
import { StageTimeline } from '../components/scan/StageTimeline';
import { LiveMetrics } from '../components/scan/LiveMetrics';
import { CurrentFileCard } from '../components/scan/CurrentFileCard';
import { LiveFindingFeed } from '../components/scan/LiveFindingFeed';
import { ProgressHeader } from '../components/scan/ProgressHeader';
import { motion } from 'framer-motion';

export const LiveScanDashboard: React.FC = () => {
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
    vulnerabilities,
  } = useLiveScan();

  return (
    <div className="min-h-screen bg-[#070B16] text-[#F8FAFC] font-sans antialiased selection:bg-[#18E6A8]/20 selection:text-[#18E6A8]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        <ProgressHeader />

        {/* Overall Scan Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -3, transition: { duration: 0.25 } }}
          className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.36)] rounded-2xl p-6 sm:p-8 transition-all duration-200"
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight font-sans">
                Overall Scan Progress
              </h2>
              <p className="text-xs text-[#94A3B8] font-mono mt-1">
                {status === 'FAILED' ? 'Scan Failed' : currentScanner || 'AST Static Scanner'}
              </p>
            </div>
            <div className="text-3xl font-black font-mono text-[#18E6A8] tracking-tight">
              {Math.round(overallProgressPct)}%
            </div>
          </div>
          <AnimatedProgressBar percentage={overallProgressPct} />
        </motion.div>

        {/* Live Metrics Grid */}
        <LiveMetrics
          elapsedSeconds={elapsedSeconds}
          etaSeconds={etaSeconds}
          filesPerSecond={filesPerSecond}
          vulnerabilityCount={vulnerabilities.length}
        />

        {/* Main Grid: Current File & Stream vs Scan Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <CurrentFileCard currentFolder={currentFolder} currentFile={currentFile} />
            <div className="flex-1">
              <LiveFindingFeed vulnerabilities={vulnerabilities} />
            </div>
          </div>
          <div className="lg:col-span-1 min-h-[480px]">
            <StageTimeline currentStage={stage} status={status} />
          </div>
        </div>
      </div>
    </div>
  );
};
