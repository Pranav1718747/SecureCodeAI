import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // ms
}

export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onDismiss,
  duration = 10000,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50 bg-[#111827] border border-[#18E6A8]/40 p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex items-center gap-4 font-mono text-xs text-[#F8FAFC]"
      >
        <div className="w-2 h-2 rounded-full bg-[#18E6A8] animate-ping" />

        <span>{message}</span>

        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] px-3 py-1.5 rounded-xl font-semibold transition-all shadow-md shadow-[#18E6A8]/20"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>UNDO ({timeLeft}s)</span>
        </button>

        <button
          onClick={onDismiss}
          className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
