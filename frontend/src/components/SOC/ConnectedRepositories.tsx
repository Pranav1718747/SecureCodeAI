import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Github,
  Search,
  GitBranch,
  Clock,
  Play,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { Repository } from '../../types/repository';
import { scanService } from '../../services/scanService';

interface ConnectedRepositoriesProps {
  repositories: Repository[];
  loading: boolean;
  onAddRepo: () => void;
}

export const ConnectedRepositories: React.FC<ConnectedRepositoriesProps> = ({
  repositories,
  loading,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [scanningRepoId, setScanningRepoId] = useState<string | null>(null);

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScanAgain = async (repo: Repository, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setScanningRepoId(repo.id);
      const newScan = await scanService.triggerScan(repo.id, repo.default_branch || 'main');
      navigate(`/review/${newScan.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger scan');
    } finally {
      setScanningRepoId(null);
    }
  };

  const handleOpenInvestigation = (repoId: string) => {
    navigate(`/repository/${repoId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 bg-[#111827] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-[#111827] rounded-[20px] border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2">
            <Github className="w-5 h-5 text-[#10B981]" />
            Connected Repositories
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Primary security overview across indexed repositories
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Repository..."
            className="w-full bg-[#111827] border border-[#243244] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/30 transition-all font-mono"
          />
        </div>
      </div>

      {/* Grid: 2 columns inside 8-column layout on Desktop */}
      {filteredRepos.length === 0 ? (
        <div className="bg-[#111827] border border-dashed border-[#243244] rounded-[20px] p-12 text-center">
          <Github className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            {searchQuery ? 'No repositories match your search' : 'No connected repositories'}
          </h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with a different repository name or clear the filter.'
              : 'Connect your GitHub repository to begin autonomous AST scanning and patch generation.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRepos.map((repo, idx) => {
            const statusType =
              repo.ast_index_status === 'INDEXED'
                ? 'Healthy'
                : repo.ast_index_status === 'INDEXING'
                ? 'Warning'
                : 'Critical';

            const statusColors = {
              Healthy: {
                badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                dot: 'bg-emerald-400',
              },
              Warning: {
                badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                dot: 'bg-amber-400',
              },
              Critical: {
                badge: 'bg-red-500/10 text-red-400 border-red-500/20',
                dot: 'bg-red-400',
              },
            };

            const mockScores = [92, 78, 85, 96, 68];
            const mockCriticals = [3, 1, 0, 2, 5];
            const mockHighs = [5, 3, 2, 1, 8];
            const mockMediums = [8, 6, 4, 3, 12];
            const mockLows = [12, 9, 6, 5, 15];

            const score = mockScores[idx % mockScores.length];
            const criticalCount = mockCriticals[idx % mockCriticals.length];
            const highCount = mockHighs[idx % mockHighs.length];
            const mediumCount = mockMediums[idx % mockMediums.length];
            const lowCount = mockLows[idx % mockLows.length];

            const isScanningThis = scanningRepoId === repo.id;

            return (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -3, transition: { duration: 0.25 } }}
                className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:border-[#10B981]/30 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_10px_35px_rgba(16,185,129,0.08)] rounded-[20px] p-6 min-h-[300px] h-full flex flex-col justify-between group relative overflow-hidden transition-all"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#10B981]/5 rounded-full blur-2xl group-hover:bg-[#10B981]/10 transition-all pointer-events-none" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#0F172A] border border-[#243244] rounded-xl group-hover:border-[#10B981]/30 transition-colors">
                        <Github className="w-5 h-5 text-slate-300 group-hover:text-[#10B981] transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white font-mono text-base group-hover:text-[#10B981] transition-colors line-clamp-1">
                          {repo.name}
                        </h3>
                        <p className="text-xs text-[#94A3B8] font-mono line-clamp-1">{repo.full_name}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${statusColors[statusType].badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[statusType].dot}`} />
                      {statusType}
                    </span>
                  </div>

                  {/* Metadata Pills */}
                  <div className="grid grid-cols-3 gap-2 my-4 text-xs font-mono">
                    <div className="bg-[#0F172A] border border-[#243244] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300">
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono truncate">{repo.default_branch || 'main'}</span>
                    </div>

                    <div className="bg-[#0F172A] border border-[#243244] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300">
                      <Code2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono truncate">{repo.language || 'TypeScript'}</span>
                    </div>

                    <div className="bg-[#0F172A] border border-[#243244] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono truncate">{new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Security Score Header */}
                  <div className="flex items-center justify-between bg-[#0F172A] border border-[#243244] px-3.5 py-2 rounded-xl my-4">
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      Security Score
                    </span>
                    <span className="text-sm font-bold font-mono text-[#F8FAFC]">
                      {score}<span className="text-xs text-[#94A3B8] font-normal">/100</span>
                    </span>
                  </div>

                  {/* Vulnerabilities Breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-center my-4">
                    <div className="bg-[#0F172A] border border-[#243244] p-2 rounded-xl">
                      <span className="text-[10px] text-[#94A3B8] font-semibold uppercase block">Critical</span>
                      <span className="text-sm font-bold font-mono text-red-400">{criticalCount}</span>
                    </div>

                    <div className="bg-[#0F172A] border border-[#243244] p-2 rounded-xl">
                      <span className="text-[10px] text-[#94A3B8] font-semibold uppercase block">High</span>
                      <span className="text-sm font-bold font-mono text-amber-400">{highCount}</span>
                    </div>

                    <div className="bg-[#0F172A] border border-[#243244] p-2 rounded-xl">
                      <span className="text-[10px] text-[#94A3B8] font-semibold uppercase block">Medium</span>
                      <span className="text-sm font-bold font-mono text-blue-400">{mediumCount}</span>
                    </div>

                    <div className="bg-[#0F172A] border border-[#243244] p-2 rounded-xl">
                      <span className="text-[10px] text-[#94A3B8] font-semibold uppercase block">Low</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">{lowCount}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleOpenInvestigation(repo.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#10B981] hover:bg-[#34D399] text-slate-950 rounded-xl text-xs font-semibold shadow-sm shadow-[#10B981]/20 transition-all"
                  >
                    <span>Open Investigation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleScanAgain(repo, e)}
                    disabled={isScanningThis}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-transparent hover:bg-[#0F172A] text-slate-200 border border-[#243244] rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {isScanningThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
                        <span className="font-mono">Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#10B981] fill-[#10B981]" />
                        <span>Scan Again</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
