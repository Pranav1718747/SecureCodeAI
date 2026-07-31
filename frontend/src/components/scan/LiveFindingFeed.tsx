import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bug, Lock, FileWarning, Search } from 'lucide-react';
import { Vulnerability } from '../../types/scan';

const severityStyles = {
  CRITICAL: 'text-[#F05B68] bg-[#F05B68]/10 border-[#F05B68]/20',
  HIGH: 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20',
  MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  LOW: 'text-[#18E6A8] bg-[#18E6A8]/10 border-[#18E6A8]/20',
};

const getIcon = (category: string) => {
  if (category.toLowerCase().includes('secret') || category.toLowerCase().includes('auth')) return Lock;
  if (category.toLowerCase().includes('injection')) return AlertTriangle;
  return Bug;
};

export const LiveFindingFeed: React.FC<{ vulnerabilities: Vulnerability[] }> = ({
  vulnerabilities,
}) => {
  const recentVulns = [...vulnerabilities].reverse().slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col h-[420px] transition-all duration-200"
    >
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#151E2D]">
        <h3 className="font-mono font-bold text-sm text-[#F8FAFC] flex items-center gap-2.5 uppercase tracking-wider">
          <FileWarning className="h-4 w-4 text-[#F05B68]" />
          Live Findings Stream
        </h3>
        <span className="text-xs font-mono font-bold bg-[#111827] border border-white/[0.08] text-[#18E6A8] px-3 py-1 rounded-full">
          {vulnerabilities.length} Total Findings
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#070B16]/40">
        {recentVulns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#64748B] font-sans">
            <Search className="h-8 w-8 mb-3 opacity-30 text-[#18E6A8]" />
            <p className="text-sm font-semibold text-[#F8FAFC]">Scanning for vulnerabilities...</p>
            <p className="text-xs mt-1 text-[#94A3B8] font-mono">Findings will stream here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {recentVulns.map((vuln) => {
                const Icon = getIcon(vuln.owasp_category || '');
                const sevStyle =
                  severityStyles[vuln.severity as keyof typeof severityStyles] || severityStyles.MEDIUM;

                return (
                  <motion.div
                    key={vuln.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ x: 3, transition: { duration: 0.2 } }}
                    className={`p-4 rounded-xl border ${sevStyle} flex gap-3 transition-all duration-200 group cursor-default`}
                  >
                    <div className="mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 font-sans">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-[#F8FAFC] truncate pr-4 group-hover:text-[#18E6A8] transition-colors">
                          {vuln.title}
                        </h4>
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-current">
                          {vuln.severity}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-[#94A3B8] truncate mb-2">
                        {vuln.file_path}:{vuln.line_start}
                      </div>

                      <div className="text-xs font-mono bg-[#151E2D] p-2 rounded-lg text-[#F8FAFC] border border-white/[0.06] truncate">
                        {vuln.snippet || 'Code snippet hidden'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
