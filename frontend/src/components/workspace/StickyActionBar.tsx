import React from 'react';
import { GitPullRequest, Download, Share, X, Wand2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StickyActionBarProps {
  scanId: string;
  repoId: string;
  hasPatch: boolean;
  isGeneratingPatch: boolean;
  onGeneratePatch: () => void;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  scanId,
  repoId,
  hasPatch,
  isGeneratingPatch,
  onGeneratePatch,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-[#070B16] border-b border-white/[0.08] shrink-0 font-sans">
      <div className="flex items-center gap-4">
        <Link
          to={`/repository/${repoId}`}
          className="flex items-center justify-center p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] transition-colors border border-white/[0.08]"
          title="Back to Repository"
        >
          <X className="h-4 w-4" />
        </Link>
        <div className="h-6 w-px bg-white/[0.08]" />
        <div>
          <h1 className="text-sm font-bold tracking-tight text-[#F8FAFC]">
            Investigation Workspace
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono">Scan #{scanId.split('-')[0]}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 font-mono text-xs">
        <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] rounded-xl transition-all border border-white/[0.08]">
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] rounded-xl transition-all border border-white/[0.08]">
          <Share className="h-3.5 w-3.5" />
          Share
        </button>
        <div className="h-6 w-px bg-white/[0.08] mx-0.5" />

        {/* Generate AI Patch Primary CTA Button */}
        {!hasPatch && (
          <button
            onClick={onGeneratePatch}
            disabled={isGeneratingPatch}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-[#070B16] bg-[#18E6A8] hover:bg-[#34D399] rounded-xl shadow-lg shadow-[#18E6A8]/20 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isGeneratingPatch ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#070B16]" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 text-[#070B16]" />
            )}
            {isGeneratingPatch ? 'Generating Patch...' : 'Generate AI Patch'}
          </button>
        )}

        {hasPatch && (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#18E6A8] bg-[#18E6A8]/10 border border-[#18E6A8]/20 cursor-default rounded-xl"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            Patch Ready
          </button>
        )}
      </div>
    </div>
  );
};
