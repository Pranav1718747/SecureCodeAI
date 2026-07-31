import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Activity } from 'lucide-react';
import { Scan } from '../../types/scan';

interface RepositoryHealthProps {
  scans: Scan[];
}

export const RepositoryHealth: React.FC<RepositoryHealthProps> = ({ scans }) => {
  const latestCompletedScan = scans.find((s) => s.status === 'COMPLETED');

  const total = latestCompletedScan?.total_vulnerabilities || 0;

  const mockCounts = {
    critical: Math.floor(total * 0.1),
    high: Math.floor(total * 0.2),
    medium: Math.floor(total * 0.4),
    low: total - (Math.floor(total * 0.1) + Math.floor(total * 0.2) + Math.floor(total * 0.4)),
  };

  const riskScore =
    total === 0
      ? 100
      : Math.max(
          0,
          100 - (mockCounts.critical * 10 + mockCounts.high * 5 + mockCounts.medium * 2)
        );

  const grade =
    riskScore >= 90
      ? 'A+'
      : riskScore >= 80
      ? 'A'
      : riskScore >= 70
      ? 'B'
      : riskScore >= 50
      ? 'C'
      : riskScore >= 30
      ? 'D'
      : 'F';

  const colorClass =
    riskScore >= 80 ? 'text-[#18E6A8]' : riskScore >= 50 ? 'text-[#FBBF24]' : 'text-[#F05B68]';
  const ringClass =
    riskScore >= 80 ? 'stroke-[#18E6A8]' : riskScore >= 50 ? 'stroke-[#FBBF24]' : 'stroke-[#F05B68]';

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] p-6 rounded-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between h-full transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2 font-sans tracking-tight">
            <Activity className="h-5 w-5 text-[#18E6A8]" />
            Security Health
          </h3>
          <p className="text-xs text-[#94A3B8] font-sans mt-0.5">Automated posture evaluation from latest telemetry</p>
        </div>
        <span className="text-xs font-mono text-[#94A3B8] bg-[#151E2D] border border-white/[0.08] px-3 py-1 rounded-full">
          Based on latest scan
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row items-center gap-8 my-auto">
        {/* Radial Circular Progress */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              className="stroke-[#151E2D]"
              strokeWidth="8"
              fill="transparent"
              r="45"
              cx="64"
              cy="64"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className={`${ringClass}`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              fill="transparent"
              r="45"
              cx="64"
              cy="64"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-black font-mono tracking-tight ${colorClass}`}>
              {grade}
            </span>
            <span className="text-[10px] text-[#64748B] uppercase font-mono tracking-widest mt-0.5">
              Grade
            </span>
          </div>
        </div>

        {/* Severity Metric Cards */}
        <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#151E2D] p-3.5 rounded-xl border border-white/[0.06] hover:border-[#F05B68]/40 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-1 group cursor-default"
          >
            <ShieldAlert className="h-4 w-4 text-[#F05B68] mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{mockCounts.critical}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#F05B68] font-semibold">
              Critical
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#151E2D] p-3.5 rounded-xl border border-white/[0.06] hover:border-[#FBBF24]/40 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-1 group cursor-default"
          >
            <AlertTriangle className="h-4 w-4 text-[#FBBF24] mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{mockCounts.high}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FBBF24] font-semibold">
              High
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#151E2D] p-3.5 rounded-xl border border-white/[0.06] hover:border-blue-400/40 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-1 group cursor-default"
          >
            <AlertCircle className="h-4 w-4 text-blue-400 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{mockCounts.medium}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Medium
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#151E2D] p-3.5 rounded-xl border border-white/[0.06] hover:border-[#18E6A8]/40 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-1 group cursor-default"
          >
            <Info className="h-4 w-4 text-[#18E6A8] mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{mockCounts.low}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#18E6A8] font-semibold">
              Low
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
