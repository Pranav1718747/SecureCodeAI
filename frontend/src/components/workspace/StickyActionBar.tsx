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
    <div className="flex items-center justify-between px-6 py-3 bg-[#0F172A] border-b border-[#243244] shrink-0">
      <div className="flex items-center gap-4">
        <Link 
          to={`/repository/${repoId}`}
          className="flex items-center justify-center p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors"
          title="Back to Repository"
        >
          <X className="h-4 w-4" />
        </Link>
        <div className="h-6 w-px bg-[#243244]" />
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-[#F8FAFC]">
            Investigation Workspace
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono">Scan #{scanId.split('-')[0]}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-lg transition-colors border border-[#243244]">
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-lg transition-colors border border-[#243244]">
          <Share className="h-3.5 w-3.5" />
          Share
        </button>
        <div className="h-6 w-px bg-[#243244] mx-1" />
        
        {/* Generate AI Patch Primary CTA Button */}
        {!hasPatch && (
          <button 
            onClick={onGeneratePatch}
            disabled={isGeneratingPatch}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(79,70,229,0.30)] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
          >
            {isGeneratingPatch ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> : <Wand2 className="h-3.5 w-3.5 text-white" />}
            {isGeneratingPatch ? 'Generating...' : 'Generate AI Patch'}
          </button>
        )}

        {/* Existing Actions */}
        {hasPatch && (
          <button 
            disabled
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 cursor-default rounded-xl"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            Patch Ready
          </button>
        )}
      </div>
    </div>
  );
};
