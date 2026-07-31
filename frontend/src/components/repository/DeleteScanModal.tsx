import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Scan } from '../../types/scan';

interface DeleteScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scansToDelete: Scan[];
  repoName: string;
}

export const DeleteScanModal: React.FC<DeleteScanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  scansToDelete,
  repoName,
}) => {
  if (!isOpen) return null;

  const isBulk = scansToDelete.length > 1;
  const singleScan = scansToDelete[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#070B16]/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#111827] border border-[#F05B68]/30 rounded-2xl p-6 shadow-2xl z-10 font-sans"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#151E2D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 bg-[#F05B68]/10 text-[#F05B68] rounded-xl border border-[#F05B68]/20 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                {isBulk ? `Delete ${scansToDelete.length} Scans?` : 'Delete Scan?'}
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                This action cannot be undone. Selected scan data and security reports will be removed.
              </p>
            </div>
          </div>

          {!isBulk && singleScan && (
            <div className="bg-[#151E2D] border border-white/[0.08] p-4 rounded-xl space-y-2 mb-6 font-mono text-xs">
              <div className="flex justify-between items-center text-[#94A3B8]">
                <span>Scan ID:</span>
                <span className="text-[#18E6A8] font-bold">#{singleScan.id.split('-')[0]}</span>
              </div>
              <div className="flex justify-between items-center text-[#94A3B8]">
                <span>Repository:</span>
                <span className="text-[#F8FAFC] font-medium">{repoName}</span>
              </div>
              <div className="flex justify-between items-center text-[#94A3B8]">
                <span>Branch:</span>
                <span className="text-[#F8FAFC]">{singleScan.branch_name}</span>
              </div>
            </div>
          )}

          {isBulk && (
            <div className="bg-[#151E2D] border border-white/[0.08] p-4 rounded-xl mb-6 font-mono text-xs text-[#94A3B8]">
              Selected {scansToDelete.length} scan records for permanent removal.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 font-mono text-xs">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2.5 rounded-xl bg-[#F05B68] hover:bg-[#DC2626] text-white font-semibold flex items-center gap-2 shadow-lg shadow-[#F05B68]/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isBulk ? `Delete ${scansToDelete.length} Scans` : 'Delete Scan'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
