import { GitPullRequest, ShieldCheck, Download, Share, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StickyActionBarProps {
  scanId: string;
  repoId: string;
}

export const StickyActionBar = ({ scanId, repoId }: StickyActionBarProps) => {
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
          <h1 className="text-sm font-semibold text-slate-200">Investigation Workspace</h1>
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
        <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm">
          <GitPullRequest className="h-3.5 w-3.5" />
          Create PR
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          Approve & Apply
        </button>
      </div>
    </div>
  );
};
