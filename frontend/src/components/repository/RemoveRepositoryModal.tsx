import React from 'react';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RemoveRepositoryModalProps {
  isOpen: boolean;
  repoName: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const RemoveRepositoryModal: React.FC<RemoveRepositoryModalProps> = ({
  isOpen,
  repoName,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B16]/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="bg-[#111827] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#151E2D]/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#F05B68]/10 border border-[#F05B68]/20 rounded-xl text-[#F05B68]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-[#F8FAFC]">
                Remove {repoName || 'Repository'}?
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#151E2D] transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 font-sans">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              This removes the repository connection from <strong className="text-[#F8FAFC] font-mono">SecureCodeAI</strong>.
            </p>

            <div className="bg-[#F05B68]/5 border border-[#F05B68]/20 rounded-xl p-3.5 space-y-2 text-xs text-[#F05B68] font-mono">
              <p className="font-semibold flex items-center gap-1.5">
                <span>⚠️</span> Safety Notice
              </p>
              <p className="text-[11px] opacity-90 leading-normal font-sans">
                The GitHub repository itself will <strong>NOT</strong> be deleted.
                Branches, commits, Pull Requests, and Actions remain untouched.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/[0.08] bg-[#151E2D]/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] transition-all disabled:opacity-50 font-mono"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F05B68] hover:bg-red-500 text-[#F8FAFC] rounded-xl text-xs font-semibold shadow-lg shadow-[#F05B68]/20 transition-all disabled:opacity-50 font-mono"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Repository</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
