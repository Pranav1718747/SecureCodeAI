import { Wand2, X, Check, Loader2, GitPullRequest } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ActionToolbarProps {
  hasPatch: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onApply: () => void;
  onReject: () => void;
}

export const ActionToolbar = ({ hasPatch, isGenerating, onGenerate, onApply, onReject }: ActionToolbarProps) => {
  const [success, setSuccess] = useState(false);

  const handleApply = () => {
    onApply();
    setSuccess(true);
    // In a real app we'd dispatch Redux actions and maybe show a global toast.
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 sticky bottom-0 z-20 flex justify-between items-center shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]">
      <div className="text-sm text-slate-400">
        {hasPatch ? 'Review the AI-generated patch above.' : 'No patch exists for this vulnerability yet.'}
      </div>
      
      <div className="flex items-center gap-3">
        {!hasPatch ? (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {isGenerating ? 'Analyzing Code...' : 'Generate AI Patch'}
          </button>
        ) : (
          <>
            <button
              onClick={onReject}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
              Reject
            </button>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
            >
              <GitPullRequest className="h-4 w-4 text-slate-400" />
              Open PR
            </button>
            <button
              onClick={handleApply}
              disabled={success}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                success 
                  ? 'bg-emerald-600 text-white shadow-emerald-900/50' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/50'
              }`}
            >
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Applied
                  </motion.div>
                ) : (
                  <motion.div
                    key="apply"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Apply Patch
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
