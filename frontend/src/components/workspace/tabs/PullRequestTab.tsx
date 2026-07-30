import { CheckCircle2, GitPullRequest, Shield, Code, ArrowRight } from 'lucide-react';

interface PullRequestTabProps {
  prData: any;
}

export const PullRequestTab = ({ prData }: PullRequestTabProps) => {
  if (!prData) return null;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-y-auto">
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#c9d1d9] mb-2">Mission Complete</h2>
          <p className="text-[#8b949e]">The AI Security Engineer has successfully remediated the vulnerability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#c9d1d9] flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-purple-400" />
                Pull Request #{prData.pr_number || 'Created'}
              </h3>
              {prData.pr_url && (
                <a 
                  href={prData.pr_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Open Pull Request
                </a>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-[#8b949e] block mb-1">Title</span>
                <div className="text-sm text-[#c9d1d9] font-medium">{prData.pr_title}</div>
              </div>
              <div>
                <span className="text-xs text-[#8b949e] block mb-1">Branch</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-mono text-xs">{prData.base_branch}</span>
                  <ArrowRight className="h-3 w-3 text-[#8b949e]" />
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-mono text-xs">{prData.new_branch}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#8b949e] block mb-1">Commit</span>
                <div className="text-sm text-[#c9d1d9] font-mono">{prData.commit_sha}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#c9d1d9] mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Security Impact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8b949e]">Risk Score</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-400 font-bold">{prData.risk_reduced_from}</span>
                  <ArrowRight className="h-3 w-3 text-[#8b949e]" />
                  <span className="text-sm text-emerald-400 font-bold">{prData.risk_reduced_to}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8b949e]">AI Confidence</span>
                <span className="text-sm text-blue-400 font-medium">{prData.confidence}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8b949e]">Validation Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-medium">Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
            <h3 className="text-sm font-semibold text-[#c9d1d9] flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-400" />
              Changes
            </h3>
            <div className="text-xs font-medium space-x-3">
              <span className="text-emerald-400">+{prData.additions}</span>
              <span className="text-red-400">-{prData.deletions}</span>
              <span className="text-[#8b949e]">{prData.files_changed} files</span>
            </div>
          </div>
          <div className="p-4 bg-[#0d1117] overflow-x-auto">
            <pre className="text-sm font-mono text-[#c9d1d9] whitespace-pre-wrap">
              {prData.diff_content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
