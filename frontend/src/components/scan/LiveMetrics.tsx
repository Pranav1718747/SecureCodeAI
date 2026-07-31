import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Zap, Clock, ShieldAlert } from 'lucide-react';

interface LiveMetricsProps {
  elapsedSeconds: number;
  etaSeconds: number;
  filesPerSecond: number;
  vulnerabilityCount: number;
}

const formatTime = (seconds: number) => {
  if (seconds === 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const LiveMetrics: React.FC<LiveMetricsProps> = ({
  elapsedSeconds,
  etaSeconds,
  filesPerSecond,
  vulnerabilityCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      <MetricCard
        title="Elapsed Time"
        value={formatTime(elapsedSeconds)}
        icon={<Timer className="h-5 w-5 text-[#18E6A8]" />}
      />
      <MetricCard
        title="Est. Remaining"
        value={formatTime(etaSeconds)}
        icon={<Clock className="h-5 w-5 text-blue-400" />}
      />
      <MetricCard
        title="Processing Speed"
        value={filesPerSecond > 0 ? `${filesPerSecond.toFixed(1)} f/s` : '--'}
        icon={<Zap className="h-5 w-5 text-[#FBBF24]" />}
      />
      <MetricCard
        title="Findings"
        value={vulnerabilityCount.toString()}
        icon={<ShieldAlert className="h-5 w-5 text-[#F05B68]" />}
        highlight={vulnerabilityCount > 0}
      />
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  icon,
  highlight,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className={`bg-[#111827] border ${
      highlight
        ? 'border-[#F05B68]/40 shadow-[0_0_20px_rgba(240,91,104,0.15)]'
        : 'border-white/[0.08] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)]'
    } p-5 rounded-2xl flex items-center gap-4 transition-all duration-200 group cursor-default`}
  >
    <div
      className={`p-3 rounded-xl border ${
        highlight
          ? 'bg-[#F05B68]/10 border-[#F05B68]/20'
          : 'bg-[#151E2D] border-white/[0.06] group-hover:border-[#18E6A8]/30'
      } transition-colors`}
    >
      {icon}
    </div>

    <div>
      <div className="text-[#94A3B8] text-[10px] font-mono font-semibold uppercase tracking-wider">
        {title}
      </div>
      <div
        className={`text-2xl font-bold font-mono ${
          highlight ? 'text-[#F05B68]' : 'text-[#F8FAFC]'
        }`}
      >
        {value}
      </div>
    </div>
  </motion.div>
);
