import React from 'react';
import { ShieldAlert, Plus } from 'lucide-react';

interface EmptyStateProps {
  onScan: () => void;
  isScanning: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onScan, isScanning }) => {
  return (
    <div className="bg-[#111827] border border-dashed border-white/[0.08] rounded-2xl p-12 text-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#18E6A8]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#151E2D] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-5 text-[#18E6A8]">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h3 className="text-lg font-bold text-[#F8FAFC] mb-2 tracking-tight font-sans">
          No scans available for this repository.
        </h3>

        <p className="text-xs text-[#94A3B8] mb-6 font-sans leading-relaxed">
          Run your first security scan to begin. Discover vulnerabilities, secrets, and code flaws in real-time.
        </p>

        <button
          onClick={onScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] px-5 py-2.5 rounded-xl font-mono text-xs font-semibold shadow-lg shadow-[#18E6A8]/20 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isScanning ? 'Initializing Scan...' : 'Run First Scan'}</span>
        </button>
      </div>
    </div>
  );
};
