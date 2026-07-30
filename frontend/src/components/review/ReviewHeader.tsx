import { Link } from 'react-router-dom';
import { ArrowLeft, Github, GitBranch, GitCommit, Download, Share2, RefreshCw, FileJson } from 'lucide-react';
import { Scan } from '../../types/scan';

interface ReviewHeaderProps {
  scan: Scan;
  repositoryName: string;
}

export const ReviewHeader = ({ scan, repositoryName }: ReviewHeaderProps) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <Link to={`/repository/${scan.repository}`} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700/50">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Github className="h-5 w-5 text-slate-400" />
              {repositoryName}
            </h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              scan.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              scan.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {scan.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">
              <GitBranch className="h-3.5 w-3.5 text-slate-500" />
              {scan.branch_name || 'main'}
            </span>
            {scan.commit_hash && (
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <GitCommit className="h-3.5 w-3.5 text-slate-500" />
                {scan.commit_hash.substring(0, 7)}
              </span>
            )}
            <span className="font-mono text-xs text-slate-500 hidden sm:inline">
              ID: {scan.id.split('-')[0]}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-colors border border-slate-700">
          <FileJson className="h-4 w-4 text-slate-400" />
          <span className="hidden sm:inline">Export JSON</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-colors border border-slate-700">
          <Download className="h-4 w-4 text-slate-400" />
          <span className="hidden sm:inline">SARIF</span>
        </button>
        <div className="w-px h-6 bg-slate-800 mx-1"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md transition-colors border border-slate-700">
          <Share2 className="h-4 w-4 text-blue-400" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-md transition-colors shadow-sm">
          <RefreshCw className="h-4 w-4" />
          Re-run Scan
        </button>
      </div>
    </div>
  );
};
