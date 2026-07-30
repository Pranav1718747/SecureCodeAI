import { Scan } from '../../types/scan';
import { ShieldAlert, Loader2, GitBranch, Clock, Terminal, ShieldCheck, Download, ExternalLink, FileJson, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ScanHistoryCardProps {
  scan: Scan;
}

export const ScanHistoryCard = ({ scan }: ScanHistoryCardProps) => {
  const isCompleted = scan.status === 'COMPLETED';
  const isFailed = scan.status === 'FAILED';
  const isRunning = scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED';

  // Format Duration
  let durationStr = '--';
  if (scan.started_at && scan.completed_at) {
    const s = new Date(scan.started_at).getTime();
    const e = new Date(scan.completed_at).getTime();
    const diffSecs = Math.floor((e - s) / 1000);
    durationStr = `${Math.floor(diffSecs / 60)}m ${diffSecs % 60}s`;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all group shadow-sm hover:shadow-lg relative"
    >
      <Link to={`/review/${scan.id}`} className="block p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            {/* Status Icon */}
            <div className={`p-3 rounded-xl flex-shrink-0 relative ${
              isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              isRunning ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              isFailed ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isRunning && <span className="absolute inset-0 rounded-xl bg-blue-500/20 animate-ping opacity-75" />}
              {isRunning ? <Loader2 className="h-5 w-5 animate-spin relative z-10" /> : 
               isCompleted ? <ShieldCheck className="h-5 w-5 relative z-10" /> : 
               <ShieldAlert className="h-5 w-5 relative z-10" />}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-white font-semibold text-lg flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  Scan #{scan.id.split('-')[0]}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                </h4>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                  isCompleted ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  isRunning ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                  isFailed ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                  'text-slate-400 bg-slate-800 border-slate-700'
                }`}>
                  {scan.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-slate-600" />
                  {scan.branch_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-slate-600" />
                  {scan.commit_hash ? scan.commit_hash.substring(0, 7) : 'latest'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-600" />
                  {new Date(scan.created_at).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 ml-14 md:ml-0">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Duration</span>
              <span className="text-slate-300 font-mono text-sm">{durationStr}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Findings</span>
              <span className={`text-xl font-bold ${
                !isCompleted ? 'text-slate-500' :
                scan.total_vulnerabilities > 0 ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {!isCompleted ? '--' : scan.total_vulnerabilities}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Hover Action Bar */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 flex items-center">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors" title="Download Report">
            <Download className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors" title="Export JSON">
            <FileJson className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors" title="Compare">
            <ExternalLink className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isFailed && scan.error_message && (
        <div className="px-5 pb-5 pt-0 ml-14">
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
            <p className="text-xs text-red-400 font-mono line-clamp-2">{scan.error_message}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
