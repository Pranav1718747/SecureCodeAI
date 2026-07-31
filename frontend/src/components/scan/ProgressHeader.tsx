import React from 'react';
import { Shield, GitBranch, Github, Activity, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';

export const ProgressHeader: React.FC = () => {
  const scan = useSelector((state: RootState) => state.scans.activeScan);

  if (!scan) return null;

  const repoName = scan.repository ? `Repository #${scan.repository.substring(0, 8)}` : 'Main Repository';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] p-6 rounded-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all duration-200 group"
    >
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#18E6A8]/5 rounded-full blur-3xl group-hover:bg-[#18E6A8]/10 transition-all pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Avatar, Title, Branch & Repo */}
        <div className="flex items-center gap-5">
          <div className="p-4 bg-[#151E2D] border border-white/[0.08] rounded-2xl shadow-inner group-hover:border-[#18E6A8]/30 flex-shrink-0 transition-colors">
            <Shield className="h-8 w-8 text-[#18E6A8]" />
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
                Live Security Scan
              </h1>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8] text-xs font-mono font-bold rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#18E6A8] animate-ping" />
                IN PROGRESS
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1.5 bg-[#151E2D] border border-white/[0.06] px-2.5 py-1 rounded-lg text-[#F8FAFC]">
                <Github className="h-3.5 w-3.5 text-[#18E6A8]" />
                {repoName}
              </span>

              <span className="flex items-center gap-1.5 bg-[#151E2D] border border-white/[0.06] px-2.5 py-1 rounded-lg text-[#F8FAFC]">
                <GitBranch className="h-3.5 w-3.5 text-[#64748B]" />
                {scan.branch_name || 'main'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Scan Telemetry Chips */}
        <div className="flex items-center gap-3 font-mono text-xs text-[#94A3B8]">
          <div className="bg-[#151E2D] border border-white/[0.08] px-3.5 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#18E6A8]" />
            <span>ID: <strong className="text-[#F8FAFC]">#{scan.id.split('-')[0]}</strong></span>
          </div>

          <div className="bg-[#151E2D] border border-white/[0.08] px-3.5 py-2 rounded-xl flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#18E6A8]" />
            <span>Trigger: <strong className="text-[#F8FAFC]">{scan.trigger_source || 'MANUAL'}</strong></span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
