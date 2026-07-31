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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2 font-sans">
            <GitPullRequest className="w-5 h-5 text-[#18E6A8]" />
            AI Generated Pull Requests
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1 font-sans">Recently generated secure remediations</p>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">4 Active PRs</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-[#94A3B8] uppercase font-semibold text-[10px] tracking-wider font-mono">
              <th className="pb-3 pt-1 px-3">Pull Request</th>
              <th className="pb-3 pt-1 px-3">Repository</th>
              <th className="pb-3 pt-1 px-3">Validation</th>
              <th className="pb-3 pt-1 px-3">Merge Risk</th>
              <th className="pb-3 pt-1 px-3">Status</th>
              <th className="pb-3 pt-1 px-3 text-right">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {pullRequests.map((pr, idx) => (
              <motion.tr
                key={pr.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="h-14 hover:bg-[#151E2D] transition-colors group cursor-pointer"
              >
                <td className="py-3 px-3 font-medium text-[#F8FAFC] group-hover:text-[#18E6A8] transition-colors max-w-xs truncate font-sans">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-3.5 h-3.5 text-[#18E6A8] flex-shrink-0" />
                    <span className="truncate">{pr.title}</span>
                    <span className="text-[10px] text-[#64748B] font-mono">#{pr.prNumber}</span>
                  </div>
                </td>

                <td className="py-3 px-3 text-[#94A3B8] font-mono font-medium">{pr.repo}</td>

                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#18E6A8] font-mono">
                    <CheckCircle2 className="w-3 h-3 text-[#18E6A8]" />
                    {pr.validation}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8]">
                    {pr.mergeRisk}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono border ${
                      pr.status === 'MERGED'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-[#18E6A8]/10 text-[#18E6A8] border-[#18E6A8]/20'
                    }`}
                  >
                    {pr.status}
                  </span>
                </td>

                <td className="py-3 px-3 text-right text-[#64748B] font-mono text-[11px]">{pr.time}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#94A3B8] font-sans">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#18E6A8]" />
          All PRs pass automated syntax & compilation checks
        </span>
        <span className="text-[#94A3B8] hover:text-[#18E6A8] cursor-pointer font-medium flex items-center gap-1 transition-colors font-mono text-[11px]">
          View GitHub PR Queue <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
};
