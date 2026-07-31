import React from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

interface PRItem {
  id: string;
  title: string;
  repo: string;
  prNumber: number;
  status: 'PR_OPENED' | 'VERIFIED' | 'MERGED';
  validation: string;
  time: string;
  mergeRisk: 'LOW' | 'MEDIUM' | 'NEGLIGIBLE';
}

export const RecentPRsTable: React.FC = () => {
  const pullRequests: PRItem[] = [
    {
      id: 'pr-1',
      title: 'fix(security): sanitize user input in authentication endpoint (CWE-89)',
      repo: 'backend-api',
      prNumber: 142,
      status: 'PR_OPENED',
      validation: 'Semgrep + Bandit Clean',
      time: '10m ago',
      mergeRisk: 'NEGLIGIBLE',
    },
    {
      id: 'pr-2',
      title: 'security: escape HTML output in search query parameters (CWE-79)',
      repo: 'frontend-web',
      prNumber: 98,
      status: 'VERIFIED',
      validation: 'AST + Syntax Verified',
      time: '28m ago',
      mergeRisk: 'LOW',
    },
    {
      id: 'pr-3',
      title: 'refactor(env): migrate plain secrets to environment variables (CWE-798)',
      repo: 'cloud-infrastructure',
      prNumber: 54,
      status: 'MERGED',
      validation: 'Trivy + Secret Scanner Pass',
      time: '1h ago',
      mergeRisk: 'NEGLIGIBLE',
    },
    {
      id: 'pr-4',
      title: 'security: patch SSRF URL validation logic in webhook dispatcher',
      repo: 'services-core',
      prNumber: 31,
      status: 'PR_OPENED',
      validation: 'Unit Tests 100% Pass',
      time: '2h ago',
      mergeRisk: 'LOW',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-slate-900/90 border border-slate-800/90 rounded-[18px] p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-full"
    >
      {/* Header (24px mb) */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-emerald-400" />
            AI Generated Pull Requests
          </h3>
          <p className="text-xs text-slate-400 mt-1">Recently generated secure remediations</p>
        </div>
        <span className="text-xs font-mono text-slate-500">4 Active PRs</span>
      </div>

      {/* Table starts immediately */}
      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="pb-3 pt-1 px-2">Pull Request</th>
              <th className="pb-3 pt-1 px-2">Repository</th>
              <th className="pb-3 pt-1 px-2">Validation</th>
              <th className="pb-3 pt-1 px-2">Merge Risk</th>
              <th className="pb-3 pt-1 px-2">Status</th>
              <th className="pb-3 pt-1 px-2 text-right">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pullRequests.map((pr, idx) => (
              <motion.tr
                key={pr.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="h-14 hover:bg-slate-800/40 transition-colors group cursor-pointer"
              >
                <td className="py-3 px-2 font-medium text-slate-200 group-hover:text-emerald-400 transition-colors max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{pr.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">#{pr.prNumber}</span>
                  </div>
                </td>

                <td className="py-3 px-2 text-slate-300 font-mono font-medium">{pr.repo}</td>

                <td className="py-3 px-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {pr.validation}
                  </span>
                </td>

                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {pr.mergeRisk}
                  </span>
                </td>

                <td className="py-3 px-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      pr.status === 'MERGED'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {pr.status}
                  </span>
                </td>

                <td className="py-3 px-2 text-right text-slate-400 font-mono text-[11px]">{pr.time}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          All PRs pass automated syntax & compilation checks
        </span>
        <span className="text-slate-400 hover:text-emerald-400 cursor-pointer font-medium flex items-center gap-1">
          View GitHub PR Queue <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
};
