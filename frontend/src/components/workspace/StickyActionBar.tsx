import { GitPullRequest, Download, Share, X, Wand2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StickyActionBarProps {
  scanId: string;
  repoId: string;
  hasPatch: boolean;
  isGeneratingPatch: boolean;
  onGeneratePatch: () => void;
}

export const StickyActionBar = ({ scanId, repoId, hasPatch, isGeneratingPatch, onGeneratePatch }: StickyActionBarProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#0a0f1c] border-b border-slate-800 shrink-0">
      <div className="flex items-center gap-4">
        <Link 
          to={`/repository/${repoId}`}
          className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Back to Repository"
        >
          <X className="h-4 w-4" />
        </Link>
        <div className="h-6 w-px bg-slate-800" />
        <div>
          <h1 className="text-sm font-normal tracking-tight text-slate-200">Investigation <span className="font-serif italic text-brand-400">Workspace</span></h1>
          <p className="text-xs text-slate-500 font-mono">Scan #{scanId.split('-')[0]}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700">
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700">
          <Share className="h-3.5 w-3.5" />
          Share
        </button>
        <div className="h-6 w-px bg-slate-800 mx-1" />
        
        {/* Generate Patch Button */}
        {!hasPatch && (
          <button 
            onClick={onGeneratePatch}
            disabled={isGeneratingPatch}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
          >
            {isGeneratingPatch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {isGeneratingPatch ? 'Generating...' : 'Generate AI Patch'}
          </button>
        )}

        {/* Existing Actions (only show if patch exists for context) */}
        {hasPatch && (
          <button 
            disabled
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600/50 cursor-not-allowed rounded-md transition-colors shadow-sm"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            Patch Ready
          </button>
        )}
      </div>
    </div>
  );
};
