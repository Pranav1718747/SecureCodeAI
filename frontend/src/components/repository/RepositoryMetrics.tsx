import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle2, AlertCircle, FileCode, Users } from 'lucide-react';

interface RepositoryMetricsProps {
  totalScans: number;
  totalVulnerabilities: number;
}

export const RepositoryMetrics = ({ totalScans, totalVulnerabilities }: RepositoryMetricsProps) => {
  const metrics = [
    { label: 'Total Scans', value: totalScans, icon: Target, delay: 0 },
    { label: 'Avg Scan Time', value: '2m 14s', icon: Clock, delay: 0.1 },
    { label: 'Total Findings', value: totalVulnerabilities, icon: AlertCircle, delay: 0.2 },
    { label: 'Resolved', value: Math.floor(totalVulnerabilities * 0.4), icon: CheckCircle2, delay: 0.3 }, // Mock
    { label: 'Lines of Code', value: '14.2k', icon: FileCode, delay: 0.4 }, // Mock
    { label: 'Contributors', value: 3, icon: Users, delay: 0.5 }, // Mock
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((m) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: m.delay }}
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-3">
            <m.icon className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{m.label}</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {m.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
