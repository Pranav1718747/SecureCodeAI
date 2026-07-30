import { motion } from 'framer-motion';
import { Timer, Zap, Clock, ShieldAlert } from 'lucide-react';

interface LiveMetricsProps {
  elapsedSeconds: number;
  etaSeconds: number;
  filesPerSecond: number;
  vulnerabilityCount: number;
}

const formatTime = (seconds: number) => {
  if (seconds === 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const LiveMetrics = ({ elapsedSeconds, etaSeconds, filesPerSecond, vulnerabilityCount }: LiveMetricsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Elapsed Time" 
        value={formatTime(elapsedSeconds)} 
        icon={<Timer className="h-5 w-5 text-blue-400" />} 
      />
      <MetricCard 
        title="Est. Remaining" 
        value={formatTime(etaSeconds)} 
        icon={<Clock className="h-5 w-5 text-indigo-400" />} 
      />
      <MetricCard 
        title="Processing Speed" 
        value={filesPerSecond > 0 ? `${filesPerSecond.toFixed(1)} f/s` : "--"} 
        icon={<Zap className="h-5 w-5 text-yellow-400" />} 
      />
      <MetricCard 
        title="Findings" 
        value={vulnerabilityCount.toString()} 
        icon={<ShieldAlert className="h-5 w-5 text-rose-400" />} 
        highlight={vulnerabilityCount > 0}
      />
    </div>
  );
};

const MetricCard = ({ title, value, icon, highlight }: { title: string, value: string, icon: React.ReactNode, highlight?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-slate-900 border ${highlight ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-slate-800'} p-4 rounded-xl flex items-center gap-4`}
  >
    <div className={`p-3 rounded-lg ${highlight ? 'bg-rose-500/10' : 'bg-slate-800'}`}>
      {icon}
    </div>
    <div>
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-rose-400' : 'text-white'}`}>{value}</div>
    </div>
  </motion.div>
);
