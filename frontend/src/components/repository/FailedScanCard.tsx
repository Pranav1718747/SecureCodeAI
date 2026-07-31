import React from 'react';
import { Scan } from '../../types/scan';
import { ShieldAlert, RefreshCw, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface FailedScanCardProps {
  scan: Scan;
  onRetry?: (scanId: string) => void;
  onViewLogs?: (scan: Scan) => void;
  onDownloadLogs?: (scan: Scan) => void;
}

export const FailedScanCard: React.FC<FailedScanCardProps> = ({
  scan,
  onRetry,
  onViewLogs,
  onDownloadLogs,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] border border-[#F05B68]/30 rounded-2xl overflow-hidden shadow-lg p-5 sm:p-6 transition-all duration-200"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <div className="p-3 bg-[#F05B68]/10 text-[#F05B68] rounded-xl border border-[#F05B68]/20 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1 font-mono">
              <h4 className="text-[#F8FAFC] font-bold text-base">
                Scan #{scan.id.split('-')[0]} Failed
              </h4>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#F05B68]/20 text-[#F05B68] bg-[#F05B68]/10">
                FAILED
              </span>
            </div>

            <p className="text-xs text-[#F05B68] font-mono line-clamp-1">
              {scan.error_message || 'Static AST parser timed out during taint analysis.'}
            </p>
          </div>
        </div>

        {/* Failed Scan Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => onViewLogs?.(scan)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Logs</span>
          </button>

          <button
            onClick={() => onDownloadLogs?.(scan)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Logs</span>
          </button>

          <button
            onClick={() => onRetry?.(scan.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] rounded-xl font-semibold transition-all shadow-md shadow-[#18E6A8]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Scan</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
