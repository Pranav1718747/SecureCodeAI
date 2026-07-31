import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle2, AlertCircle, FileCode, Users } from 'lucide-react';

interface RepositoryMetricsProps {
  totalScans: number;
  totalVulnerabilities: number;
}

export const RepositoryMetrics: React.FC<RepositoryMetricsProps> = ({
  totalScans,
  totalVulnerabilities,
}) => {
  const metrics = [
    { label: 'Total Scans', value: totalScans, icon: Target, delay: 0 },
    { label: 'Avg Scan Time', value: '2m 14s', icon: Clock, delay: 0.1 },
    { label: 'Total Findings', value: totalVulnerabilities, icon: AlertCircle, delay: 0.2 },
    { label: 'Resolved', value: Math.floor(totalVulnerabilities * 0.4), icon: CheckCircle2, delay: 0.3 },
    { label: 'Lines of Code', value: '14.2k', icon: FileCode, delay: 0.4 },
    { label: 'Contributors', value: 3, icon: Users, delay: 0.5 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((m) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: m.delay, duration: 0.25 }}
          whileHover={{ y: -3, transition: { duration: 0.25 } }}
          className="bg-[#111827] border border-white/[0.08] p-4 rounded-2xl flex flex-col justify-between hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] transition-all duration-200 group cursor-default"
        >
          <div className="flex items-center gap-2 mb-3">
            <m.icon className="h-4 w-4 text-[#94A3B8] group-hover:text-[#18E6A8] transition-colors" />
            <span className="text-[10px] font-mono font-semibold text-[#94A3B8] uppercase tracking-wider">
              {m.label}
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-[#F8FAFC]">
            {m.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
