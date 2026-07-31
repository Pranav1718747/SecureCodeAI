import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  GitBranch,
  Terminal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Scan } from '../../types/scan';

interface ScanDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scan: Scan | null;
}

export const ScanDetailsDrawer: React.FC<ScanDetailsDrawerProps> = ({
  isOpen,
  onClose,
  scan,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'findings' | 'validation' | 'logs'>(
    'summary'
  );

  if (!isOpen || !scan) return null;

  const isCompleted = scan.status === 'COMPLETED';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#070B16]/80 backdrop-blur-sm"
        />

        {/* Slide-over Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-2xl bg-[#111827] border-l border-white/[0.08] p-6 sm:p-8 shadow-2xl flex flex-col justify-between font-sans overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#18E6A8]/10 text-[#18E6A8] rounded-xl border border-[#18E6A8]/20">
                    {isCompleted ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#F8FAFC]">
                      {scan.custom_name || `Scan #${scan.id.split('-')[0]}`}
                    </h3>
                    <p className="text-xs text-[#94A3B8] font-mono">ID: {scan.id}</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#151E2D] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 mb-6 font-mono text-xs">
                {(['summary', 'findings', 'validation', 'logs'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-[#18E6A8] text-[#070B16] font-semibold shadow-md'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div className="bg-[#151E2D] p-4 rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase">Total Vulnerabilities</span>
                      <p className="text-2xl font-bold text-[#F05B68] mt-1">{scan.total_vulnerabilities}</p>
                    </div>

                    <div className="bg-[#151E2D] p-4 rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase">Scan Status</span>
                      <p className="text-2xl font-bold text-[#18E6A8] mt-1">{scan.status}</p>
                    </div>
                  </div>

                  <div className="bg-[#151E2D] p-5 rounded-xl border border-white/[0.08] space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>Branch:</span>
                      <span className="text-[#F8FAFC] flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-[#18E6A8]" />
                        {scan.branch_name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>Commit Hash:</span>
                      <span className="text-[#F8FAFC] flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#64748B]" />
                        {scan.commit_hash || 'latest'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>Trigger Source:</span>
                      <span className="text-[#F8FAFC]">{scan.trigger_source}</span>
                    </div>

                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>Started At:</span>
                      <span className="text-[#F8FAFC]">
                        {scan.started_at ? new Date(scan.started_at).toLocaleString() : '--'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>Completed At:</span>
                      <span className="text-[#F8FAFC]">
                        {scan.completed_at ? new Date(scan.completed_at).toLocaleString() : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'findings' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-[#151E2D] p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#F05B68]" />
                      <span>SQL Injection (CWE-89)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#F05B68]/10 text-[#F05B68] text-[10px] font-bold">
                      CRITICAL
                    </span>
                  </div>

                  <div className="bg-[#151E2D] p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
                      <span>Hardcoded API Key (CWE-798)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FBBF24]/10 text-[#FBBF24] text-[10px] font-bold">
                      HIGH
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'validation' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-[#151E2D] p-4 rounded-xl border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-[#18E6A8]">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Semgrep AST Validation
                      </span>
                      <span>PASSED</span>
                    </div>
                    <div className="flex items-center justify-between text-[#18E6A8]">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Bandit Security Check
                      </span>
                      <span>PASSED</span>
                    </div>
                    <div className="flex items-center justify-between text-[#18E6A8]">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Syntax Compilation Test
                      </span>
                      <span>PASSED</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="bg-[#151E2D] p-4 rounded-xl border border-white/[0.08] font-mono text-xs text-[#94A3B8] space-y-1.5 overflow-x-auto">
                  <p className="text-[#18E6A8]">[INFO] Initializing AST Static Analyzer v2.4...</p>
                  <p>[INFO] Parsing AST tree for repository branches...</p>
                  <p>[INFO] Analyzing dataflow taint paths...</p>
                  <p className="text-[#F8FAFC]">[SUCCESS] Static telemetry complete. 0 critical errors remaining.</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] transition-colors"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
