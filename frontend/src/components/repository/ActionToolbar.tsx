import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Search, Zap, ExternalLink, Settings, Download, Loader2 } from 'lucide-react';

interface ActionToolbarProps {
  onScan: () => void;
  isScanning: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({ onScan, isScanning }) => {
  const [activeScanType, setActiveScanType] = useState<'quick' | 'deep' | 'custom'>('deep');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between h-full space-y-6 transition-all duration-200"
    >
      <div>
        <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight mb-1 font-sans">
          Scanning Controls
        </h3>
        <p className="text-xs text-[#94A3B8] font-sans">
          Configure security mode and trigger AST vulnerability scan
        </p>
      </div>

      {/* Segmented Scan Type Pills */}
      <div className="bg-[#151E2D] border border-white/[0.08] p-1.5 rounded-xl grid grid-cols-2 gap-2 font-mono">
        <button
          onClick={() => setActiveScanType('quick')}
          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            activeScanType === 'quick'
              ? 'bg-[#18E6A8] text-[#070B16] shadow-md shadow-[#18E6A8]/20'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          Quick Scan
        </button>

        <button
          onClick={() => setActiveScanType('deep')}
          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            activeScanType === 'deep'
              ? 'bg-[#18E6A8] text-[#070B16] shadow-md shadow-[#18E6A8]/20'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          Deep Scan
        </button>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="p-2.5 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] hover:border-[#18E6A8]/30 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl transition-all duration-200"
            title="Export Data"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            className="p-2.5 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] hover:border-[#18E6A8]/30 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl transition-all duration-200"
            title="Open in GitHub"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            className="p-2.5 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] hover:border-[#18E6A8]/30 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl transition-all duration-200"
            title="Repository Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Run Scan CTA */}
        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] px-5 py-2.5 rounded-xl font-mono text-xs font-semibold shadow-lg shadow-[#18E6A8]/20 hover:shadow-[#18E6A8]/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#070B16]" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-[#070B16] text-[#070B16]" />
              <span>Run Scan</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
