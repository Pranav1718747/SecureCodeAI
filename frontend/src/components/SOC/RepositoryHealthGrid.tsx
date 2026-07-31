import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, GitBranch, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { Repository } from '../../types/repository';
import { Button } from '../Common';

interface RepositoryHealthGridProps {
  repositories: Repository[];
  loading: boolean;
  onAddRepo: () => void;
}

export const RepositoryHealthGrid: React.FC<RepositoryHealthGridProps> = ({
  repositories,
  loading,
  onAddRepo,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse p-6" />
        ))}
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center">
        <Github className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-1">No repositories connected</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          Connect your GitHub repository to enable autonomous AST parsing, vulnerability scanning, and automated PR patches.
        </p>
        <Button onClick={onAddRepo} icon={Plus}>
          Connect First Repository
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repositories.map((repo, idx) => {
        // Derive mock security posture based on repo index for high-fidelity presentation
        const mockScores = [92, 78, 85, 96, 68];
        const mockCriticals = [0, 2, 1, 0, 4];
        const mockHighs = [1, 4, 2, 0, 7];
        const mockFixes = [14, 22, 9, 31, 18];

        const score = mockScores[idx % mockScores.length];
        const criticals = mockCriticals[idx % mockCriticals.length];
        const highs = mockHighs[idx % mockHighs.length];
        const fixes = mockFixes[idx % mockFixes.length];

        const isProtected = score >= 80;
        const owner = repo.full_name.includes('/') ? repo.full_name.split('/')[0] : 'Organization';

        return (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 rounded-xl p-5 transition-all shadow-lg flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800/80 border border-slate-700/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                    <Github className="w-5 h-5 text-slate-300 group-hover:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {repo.name}
                    </h3>
                    <p className="text-xs text-slate-400">by {owner}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                    isProtected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  Score: {score}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="my-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Protection Health</span>
                  <span className="font-mono text-emerald-400">{score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                  <motion.div
                    className={`h-full ${isProtected ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Vulnerabilities & Fixes summary */}
              <div className="grid grid-cols-3 gap-2 my-4 text-center">
                <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Critical</span>
                  <span className={`text-sm font-bold font-mono ${criticals > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {criticals}
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">High</span>
                  <span className={`text-sm font-bold font-mono ${highs > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                    {highs}
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Fixes</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{fixes}</span>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{repo.default_branch}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-4 pt-3">
              <Link
                to={`/repository/${repo.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 rounded-lg text-xs font-semibold transition-all group/btn"
              >
                <span>Open SOC Investigation</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
