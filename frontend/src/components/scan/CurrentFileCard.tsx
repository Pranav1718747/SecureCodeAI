import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode2, FolderTree } from 'lucide-react';

interface CurrentFileCardProps {
  currentFolder: string;
  currentFile: string | null;
}

export const CurrentFileCard: React.FC<CurrentFileCardProps> = ({
  currentFolder,
  currentFile,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200 overflow-hidden font-sans"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[#94A3B8] font-mono text-xs mb-1.5">
            <FolderTree className="h-4 w-4 text-[#18E6A8]" />
            <span className="truncate">{currentFolder || 'src/'}</span>
          </div>

          <div className="flex items-center gap-3">
            <FileCode2 className="h-5 w-5 text-[#18E6A8] flex-shrink-0" />
            <div className="h-7 relative flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentFile || 'waiting'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center"
                >
                  <span className="text-lg font-bold font-mono text-[#F8FAFC] truncate">
                    {currentFile ? currentFile.split('/').pop() : 'Waiting for files...'}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Animated radar scanning pulse */}
        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-[#18E6A8]/10 border border-[#18E6A8]/20 relative flex-shrink-0">
          <motion.div
            className="absolute inset-0 rounded-2xl border border-[#18E6A8]/40"
            animate={{ scale: [1, 1.4], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
          />
          <div className="w-2.5 h-2.5 bg-[#18E6A8] rounded-full animate-ping" />
        </div>
      </div>
    </motion.div>
  );
};
