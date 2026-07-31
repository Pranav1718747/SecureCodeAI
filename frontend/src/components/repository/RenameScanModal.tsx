import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X } from 'lucide-react';
import { Scan } from '../../types/scan';

interface RenameScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scanId: string, newName: string) => void;
  scan: Scan | null;
}

export const RenameScanModal: React.FC<RenameScanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  scan,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (scan) {
      setName(scan.custom_name || `Scan #${scan.id.split('-')[0]}`);
    }
  }, [scan]);

  if (!isOpen || !scan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(scan.id, name.trim());
      onClose();
    }
  };

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
          className="relative w-full max-w-md bg-[#111827] border border-white/[0.08] rounded-2xl p-6 shadow-2xl z-10 font-sans"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#151E2D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-[#18E6A8]/10 text-[#18E6A8] rounded-xl border border-[#18E6A8]/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Rename Scan</h3>
              <p className="text-xs text-[#94A3B8] font-mono">ID: #{scan.id.split('-')[0]}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#94A3B8] mb-1.5 uppercase">
                Scan Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production Release Scan"
                className="w-full bg-[#151E2D] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#18E6A8]/50 focus:ring-1 focus:ring-[#18E6A8]/30"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] font-semibold transition-all shadow-lg shadow-[#18E6A8]/20"
              >
                Save Name
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
