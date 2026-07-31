import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, X, GitBranch } from 'lucide-react';
import { Scan } from '../../types/scan';

interface ScanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  scans: Scan[];
}

export const ScanComparisonModal: React.FC<ScanComparisonModalProps> = ({
  isOpen,
  onClose,
  scans,
}) => {
  if (!isOpen || scans.length !== 2) return null;

  const [scanA, scanB] = scans;

  // Derive diff metrics
  const diffVulns = scanB.total_vulnerabilities - scanA.total_vulnerabilities;
  const isBetter = diffVulns <= 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#070B16]/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-[#111827] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl z-10 font-sans max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#151E2D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#18E6A8]/10 text-[#18E6A8] rounded-xl border border-[#18E6A8]/20">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Scan Comparison Matrix</h3>
              <p className="text-xs text-[#94A3B8] font-mono">
                Comparing Scan #{scanA.id.split('-')[0]} vs Scan #{scanB.id.split('-')[0]}
              </p>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Scan A */}
            <div className="bg-[#151E2D] border border-white/[0.08] p-4 rounded-xl space-y-3 font-mono">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                <span className="text-xs text-[#64748B] uppercase">Baseline Scan</span>
                <span className="text-xs text-[#18E6A8] font-bold">#{scanA.id.split('-')[0]}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Branch:</span>
                <span className="text-[#F8FAFC] flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-[#64748B]" /> {scanA.branch_name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Total Findings:</span>
                <span className="text-lg font-bold text-[#F05B68]">{scanA.total_vulnerabilities}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Status:</span>
                <span className="text-[#18E6A8]">{scanA.status}</span>
              </div>
            </div>

            {/* Scan B */}
            <div className="bg-[#151E2D] border border-white/[0.08] p-4 rounded-xl space-y-3 font-mono">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                <span className="text-xs text-[#64748B] uppercase">Target Scan</span>
                <span className="text-xs text-[#18E6A8] font-bold">#{scanB.id.split('-')[0]}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Branch:</span>
                <span className="text-[#F8FAFC] flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-[#64748B]" /> {scanB.branch_name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Total Findings:</span>
                <span className="text-lg font-bold text-[#F05B68]">{scanB.total_vulnerabilities}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Status:</span>
                <span className="text-[#18E6A8]">{scanB.status}</span>
              </div>
            </div>
          </div>

          {/* Delta Summary */}
          <div className="bg-[#151E2D]/60 border border-white/[0.08] p-5 rounded-xl space-y-4 mb-6">
            <h4 className="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Differential Telemetry
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
              <div className="bg-[#111827] p-3 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] text-[#64748B] uppercase">Finding Delta</p>
                <p className={`text-xl font-bold ${isBetter ? 'text-[#18E6A8]' : 'text-[#F05B68]'}`}>
                  {diffVulns > 0 ? `+${diffVulns}` : diffVulns}
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] text-[#64748B] uppercase">New Vulns</p>
                <p className="text-xl font-bold text-[#F05B68]">
                  {Math.max(0, diffVulns)}
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] text-[#64748B] uppercase">Resolved</p>
                <p className="text-xl font-bold text-[#18E6A8]">
                  {Math.max(0, -diffVulns)}
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-xl border border-white/[0.06]">
                <p className="text-[10px] text-[#64748B] uppercase">Exec Time Diff</p>
                <p className="text-xl font-bold text-[#F8FAFC]">-14s</p>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end font-mono text-xs">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] font-semibold rounded-xl transition-all shadow-lg shadow-[#18E6A8]/20"
            >
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
