import { motion, AnimatePresence } from 'framer-motion';
import { FileCode2, FolderTree } from 'lucide-react';

export const CurrentFileCard = ({ currentFolder, currentFile }: { currentFolder: string, currentFile: string | null }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 overflow-hidden">
      <div className="flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <FolderTree className="h-4 w-4" />
            <span className="text-sm font-medium truncate">{currentFolder}</span>
          </div>
          <div className="flex items-center gap-3">
            <FileCode2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
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
                  <span className="text-lg font-semibold text-white truncate">
                    {currentFile ? currentFile.split('/').pop() : 'Waiting for files...'}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Animated scanning pulse */}
        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 relative">
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-500/30"
            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          />
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};
