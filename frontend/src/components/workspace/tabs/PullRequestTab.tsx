import { CheckCircle2, GitPullRequest, Shield, Code, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface PullRequestTabProps {
  prData: any;
}

export const PullRequestTab = ({ prData }: PullRequestTabProps) => {
  if (!prData) return null;

  return (
    <div className="flex flex-col h-full bg-[#070B16] font-sans overflow-y-auto custom-scrollbar text-[#F8FAFC]">
      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 pb-24">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-[#111827] border border-white/[0.08] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.36)]"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#18E6A8]/10 border border-[#18E6A8]/20 mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#18E6A8]" />
          </div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] tracking-tight mb-2">Mission Complete</h2>
          <p className="text-xs text-[#94A3B8] font-mono max-w-lg mx-auto leading-relaxed">
            The AI Security Engineer has successfully remediated the vulnerability and prepared a production-ready Pull Request.
          </p>
        </motion.div>

        {/* PR Details & Security Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PR Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -3, transition: { duration: 0.25 } }}
            className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-[#18E6A8]" />
                Pull Request #{prData.pr_number || 'Created'}
              </h3>
              {prData.pr_url && (
                <a
                  href={prData.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#18E6A8]/20"
                >
                  <span>Open PR</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[#94A3B8] block mb-1 uppercase font-bold text-[10px]">Title</span>
                <div className="text-[#F8FAFC] font-semibold">{prData.pr_title}</div>
              </div>
              <div>
                <span className="text-[#94A3B8] block mb-1 uppercase font-bold text-[10px]">Branches</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-[#151E2D] border border-white/[0.08] text-[#94A3B8] rounded-lg">
                    {prData.base_branch}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#18E6A8]" />
                  <span className="px-2.5 py-1 bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8] rounded-lg font-bold">
                    {prData.new_branch}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[#94A3B8] block mb-1 uppercase font-bold text-[10px]">Commit SHA</span>
                <div className="text-[#F8FAFC]">{prData.commit_sha}</div>
              </div>
            </div>
          </motion.div>

          {/* Security Impact Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -3, transition: { duration: 0.25 } }}
            className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200"
          >
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider mb-4 border-b border-white/[0.08] pb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#18E6A8]" />
              Security Impact
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Risk Score Reduction</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#F05B68] font-bold">{prData.risk_reduced_from}</span>
                  <ArrowRight className="h-3 w-3 text-[#18E6A8]" />
                  <span className="text-[#18E6A8] font-bold">{prData.risk_reduced_to}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">AI Model Confidence</span>
                <span className="text-[#18E6A8] font-bold">{prData.confidence}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">AST Validation Status</span>
                <span className="px-3 py-1 bg-[#18E6A8]/10 text-[#18E6A8] border border-[#18E6A8]/20 rounded-full font-bold">
                  Verified Safe
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Diff Changes Block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -3, transition: { duration: 0.25 } }}
          className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all duration-200"
        >
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#151E2D]">
            <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Code className="h-4 w-4 text-[#18E6A8]" />
              Patched Diff Content
            </h3>
            <div className="text-xs font-mono font-bold space-x-3">
              <span className="text-[#18E6A8]">+{prData.additions}</span>
              <span className="text-[#F05B68]">-{prData.deletions}</span>
              <span className="text-[#94A3B8]">{prData.files_changed} files</span>
            </div>
          </div>
          <div className="p-5 bg-[#070B16] overflow-x-auto custom-scrollbar font-mono">
            <pre className="text-xs text-[#F8FAFC] whitespace-pre-wrap leading-relaxed">
              {prData.diff_content}
            </pre>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
