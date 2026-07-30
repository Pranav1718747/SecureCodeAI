import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bug, Lock, FileWarning, Search } from 'lucide-react';
import { Vulnerability } from '../../types/scan';

const severityColors = {
  CRITICAL: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  HIGH: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  MEDIUM: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  LOW: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
};

const getIcon = (category: string) => {
  if (category.toLowerCase().includes('secret') || category.toLowerCase().includes('auth')) return Lock;
  if (category.toLowerCase().includes('injection')) return AlertTriangle;
  return Bug;
};

export const LiveFindingFeed = ({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) => {
  // Show only the latest 5 vulnerabilities to keep it lively but not overwhelming
  const recentVulns = [...vulnerabilities].reverse().slice(0, 5);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FileWarning className="h-4 w-4 text-rose-400" />
          Live Findings Stream
        </h3>
        <span className="text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
          {vulnerabilities.length} total
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950/30">
        {recentVulns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Search className="h-8 w-8 mb-3 opacity-20" />
            <p className="text-sm">Scanning for vulnerabilities...</p>
            <p className="text-xs mt-1 opacity-60">Findings will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {recentVulns.map((vuln) => {
                const Icon = getIcon(vuln.owasp_category || '');
                const sevColor = severityColors[vuln.severity as keyof typeof severityColors] || severityColors.MEDIUM;
                
                return (
                  <motion.div
                    key={vuln.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`p-3 rounded-lg border ${sevColor} flex gap-3`}
                  >
                    <div className="mt-0.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold truncate pr-4">{vuln.title}</h4>
                        <span className="text-[10px] font-black tracking-wider uppercase opacity-80 mt-0.5">
                          {vuln.severity}
                        </span>
                      </div>
                      <div className="text-xs opacity-80 truncate mb-1">
                        {vuln.file_path}:{vuln.line_start}
                      </div>
                      <div className="text-xs font-mono bg-black/20 p-1.5 rounded opacity-90 truncate">
                        {vuln.snippet || 'Code snippet hidden'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
