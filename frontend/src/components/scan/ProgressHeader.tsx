import { Shield, GitBranch, Github } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const ProgressHeader = () => {
  const scan = useSelector((state: RootState) => state.scans.activeScan);

  if (!scan) return null;

  let repoName = 'Repository';

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Live Security Scan
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
            <span className="flex items-center gap-1.5">
              <Github className="h-4 w-4" />
              {repoName}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">
              <GitBranch className="h-3 w-3" />
              {scan.branch_name || 'main'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
          ID: {scan.id.split('-')[0]}...
        </div>
      </div>
    </div>
  );
};
