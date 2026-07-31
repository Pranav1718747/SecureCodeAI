import React from 'react';
import { Scan } from '../../types/scan';
import { Loader2, ArrowRight, Activity, Clock, Square, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface RunningScanCardProps {
  scan: Scan;
  onStop?: (scanId: string) => void;
  onPause?: (scanId: string) => void;
  onRestart?: (scanId: string) => void;
}

export const RunningScanCard: React.FC<RunningScanCardProps> = ({
  scan,
  onStop,
  onPause,
  onRestart,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
      className="bg-[#111827] border border-[#18E6A8]/30 rounded-2xl overflow-hidden relative shadow-[0_0_30px_rgba(24,230,168,0.1)] transition-all duration-200"
    >
      {/* Animated progress indicator line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#151E2D]">
        <motion.div
          className="h-full bg-[#18E6A8]"
          initial={{ width: '0%' }}
          animate={{ width: '65%' }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        />
      </div>

      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#18E6A8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-5 sm:p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3 rounded-xl flex-shrink-0 bg-[#18E6A8]/15 text-[#18E6A8] relative border border-[#18E6A8]/30 shadow-[0_0_15px_rgba(24,230,168,0.2)]">
              <span className="absolute inset-0 rounded-xl bg-[#18E6A8]/20 animate-ping opacity-75" />
              <Loader2 className="h-5 w-5 animate-spin relative z-10" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1 font-mono">
                <h4 className="text-[#F8FAFC] font-bold text-base flex items-center gap-2">
                  Analyzing {scan.branch_name}...
                  <ArrowRight className="h-4 w-4 text-[#18E6A8]" />
                </h4>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-[#18E6A8]/30 text-[#18E6A8] bg-[#18E6A8]/10 animate-pulse">
                  IN PROGRESS
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#94A3B8] font-mono">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#18E6A8]" />
                  Static Analysis Taint Stage
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                  ~45s remaining
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Pause, Restart, Stop */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => onPause?.(scan.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl transition-all"
              title="Pause Scan Execution"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>

            <button
              onClick={() => onRestart?.(scan.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl transition-all"
              title="Restart Scan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>

            <button
              onClick={() => onStop?.(scan.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F05B68]/10 hover:bg-[#F05B68]/20 border border-[#F05B68]/20 text-[#F05B68] rounded-xl font-semibold transition-all shadow-md shadow-[#F05B68]/10"
              title="Terminate Running Scan"
            >
              <Square className="w-3.5 h-3.5 fill-[#F05B68]" />
              <span>Stop Scan</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
