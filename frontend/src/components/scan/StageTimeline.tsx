import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, AlertCircle, Activity } from 'lucide-react';

const STAGE_ORDER = [
  'Cloning Repository',
  'Analyzing File Tree',
  'Language Detection',
  'Dependency Analysis',
  'AST Parsing',
  'Semgrep Scan',
  'Bandit Scan',
  'Secret Detection',
  'Building Workflow Plan',
  'AI Analysis',
  'Cleaning Up',
];

interface StageTimelineProps {
  currentStage: string;
  status: string;
}

export const StageTimeline: React.FC<StageTimelineProps> = ({ currentStage, status }) => {
  let currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 && status === 'COMPLETED') currentIndex = STAGE_ORDER.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] h-full flex flex-col transition-all duration-200"
    >
      <h3 className="text-sm font-mono font-bold text-[#F8FAFC] mb-6 border-b border-white/[0.08] pb-3.5 flex items-center gap-2.5 uppercase tracking-wider">
        <Activity className="h-4 w-4 text-[#18E6A8]" />
        Scan Pipeline
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar font-mono text-xs">
        {STAGE_ORDER.map((stage, index) => {
          const isCompleted = index < currentIndex || status === 'COMPLETED';
          const isCurrent = index === currentIndex && status !== 'COMPLETED';
          const isPending = index > currentIndex && status !== 'COMPLETED';
          const isFailed = status === 'FAILED' && index === currentIndex;

          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-start gap-3 group"
            >
              <div className="flex flex-col items-center mt-0.5">
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-[#18E6A8]" />}
                {isCurrent && !isFailed && <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />}
                {isFailed && <AlertCircle className="h-4 w-4 text-[#F05B68]" />}
                {isPending && <Circle className="h-4 w-4 text-[#64748B]" />}
                {index < STAGE_ORDER.length - 1 && (
                  <div
                    className={`w-0.5 h-6 my-1 rounded-full ${
                      isCompleted ? 'bg-[#18E6A8]/40' : 'bg-white/[0.06]'
                    }`}
                  />
                )}
              </div>

              <div>
                <div
                  className={`text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'text-[#18E6A8]'
                      : isCompleted
                      ? 'text-[#F8FAFC]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {stage}
                </div>

                {isCurrent && !isFailed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-blue-400 mt-0.5 font-bold animate-pulse"
                  >
                    Processing stage telemetry...
                  </motion.div>
                )}

                {isFailed && (
                  <div className="text-[10px] text-[#F05B68] mt-0.5 font-bold">
                    Stage execution failed
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
