import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

const STAGE_ORDER = [
  "Cloning Repository",
  "Analyzing File Tree",
  "Language Detection",
  "Dependency Analysis",
  "AST Parsing",
  "Semgrep Scan",
  "Bandit Scan",
  "Secret Detection",
  "Building Workflow Plan",
  "AI Analysis",
  "Cleaning Up"
];

export const StageTimeline = ({ currentStage, status }: { currentStage: string, status: string }) => {
  let currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 && status === 'COMPLETED') currentIndex = STAGE_ORDER.length;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h3 className="font-semibold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
        <ActivityIcon /> Scan Pipeline
      </h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
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
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className="flex flex-col items-center mt-0.5">
                {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {isCurrent && !isFailed && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                {isFailed && <AlertCircle className="h-5 w-5 text-red-500" />}
                {isPending && <Circle className="h-5 w-5 text-slate-700" />}
                {index < STAGE_ORDER.length - 1 && (
                  <div className={`w-0.5 h-6 my-1 rounded-full ${isCompleted ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                )}
              </div>
              <div>
                <div className={`text-sm font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                  {stage}
                </div>
                {isCurrent && !isFailed && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="text-xs text-blue-400 mt-1"
                  >
                    Processing...
                  </motion.div>
                )}
                {isFailed && (
                  <div className="text-xs text-red-400 mt-1">Failed at this stage</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);
