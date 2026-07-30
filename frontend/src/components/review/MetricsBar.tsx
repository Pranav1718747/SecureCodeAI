import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Activity, Clock, FileCode } from 'lucide-react';

interface MetricsBarProps {
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  totalFiles: number;
  scanDurationSeconds: number;
}

const formatTime = (secs: number) => {
  if (!secs || isNaN(secs) || secs < 0) return "--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}m ${s}s`;
};

// Calculate a mock risk score based on counts for now
const calculateRiskScore = (counts: MetricsBarProps['counts']) => {
  const score = (counts.critical * 10) + (counts.high * 5) + (counts.medium * 2) + counts.low;
  return Math.max(0, 100 - score);
};

export const MetricsBar = ({ counts, totalFiles, scanDurationSeconds }: MetricsBarProps) => {
  const riskScore = calculateRiskScore(counts);
  const riskColor = riskScore > 80 ? 'text-emerald-400' : riskScore > 50 ? 'text-yellow-400' : 'text-rose-500';

  const metrics = [
    { label: 'Critical', value: counts.critical, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'High', value: counts.high, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Medium', value: counts.medium, icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Low', value: counts.low, icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar-on-idle">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex-shrink-0 min-w-[140px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors group relative overflow-hidden"
        >
          {/* Subtle glow on hover */}
          <div className={`absolute -inset-2 ${metric.bg} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{metric.label}</span>
          </div>
          <div className="text-3xl font-bold text-white relative z-10 flex items-baseline gap-1">
            {metric.value}
          </div>
        </motion.div>
      ))}
      
      <div className="w-px bg-slate-800 mx-2 self-stretch hidden md:block" />
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0 min-w-[160px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Risk Score</span>
        </div>
        <div className={`text-3xl font-black ${riskColor}`}>
          {riskScore}/100
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex-shrink-0 min-w-[140px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-3">
          <FileCode className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Files Scanned</span>
        </div>
        <div className="text-xl font-semibold text-slate-200">
          {totalFiles > 0 ? totalFiles : '--'}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-shrink-0 min-w-[140px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Scan Time</span>
        </div>
        <div className="text-xl font-semibold text-slate-200 font-mono">
          {formatTime(scanDurationSeconds)}
        </div>
      </motion.div>
    </div>
  );
};
