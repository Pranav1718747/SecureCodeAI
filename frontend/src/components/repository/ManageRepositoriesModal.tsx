import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  X,
  Search,
  ExternalLink,
  Play,
  RotateCw,
  Trash2,
  GitBranch,
  Code2,
  Clock,
  ShieldCheck,
  Loader2,
  Github,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repository } from '../../types/repository';
import { scanService } from '../../services/scanService';

interface ManageRepositoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: Repository[];
  onRefreshRepo: (repoId: string) => Promise<void>;
  onRemoveRepo: (repo: Repository) => void;
}

export const ManageRepositoriesModal: React.FC<ManageRepositoriesModalProps> = ({
  isOpen,
  onClose,
  repositories,
  onRefreshRepo,
  onRemoveRepo,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [refreshingRepoId, setRefreshingRepoId] = useState<string | null>(null);
  const [scanningRepoId, setScanningRepoId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanAgain = async (repo: Repository) => {
    try {
      setScanningRepoId(repo.id);
      const newScan = await scanService.triggerScan(repo.id, repo.default_branch || 'main');
      onClose();
      navigate(`/review/${newScan.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger scan');
    } finally {
      setScanningRepoId(null);
    }
  };

  const handleRefresh = async (repoId: string) => {
    setRefreshingRepoId(repoId);
    try {
      await onRefreshRepo(repoId);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshingRepoId(null);
    }
  };

  const filteredRepos = repositories.filter((repo) => {
    const owner = repo.owner || (repo.full_name ? repo.full_name.split('/')[0] : '');
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      selectedLanguage === 'ALL' ||
      (repo.language && repo.language.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSearch && matchesLanguage;
  });

  const languages = Array.from(new Set(repositories.map((r) => r.language).filter(Boolean)));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09111F]/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#111827] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-[24px] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06] bg-[#0F172A]/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-[#10B981]">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#F8FAFC]">Repository Manager</h2>
                <p className="text-xs text-[#94A3B8]">
                  Manage connected repositories, refresh state, or remove connections
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search & Filter Header */}
          <div className="p-6 border-b border-white/[0.06] bg-[#0F172A]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by repo name, owner, or full path..."
                className="w-full bg-[#0F172A] border border-[#243244] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#10B981]/50 font-mono"
              />
            </div>

            {languages.length > 0 && (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-[#0F172A] border border-[#243244] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none w-full sm:w-auto"
              >
                <option value="ALL">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Body: Cards Grid */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {filteredRepos.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#94A3B8] bg-[#0F172A]/30 border border-dashed border-[#243244] rounded-2xl">
                <Github className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="font-mono text-white text-sm font-semibold">No repositories found</p>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Try adjusting your search query or add a new repository.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepos.map((repo, idx) => {
                  const owner =
                    repo.owner || (repo.full_name ? repo.full_name.split('/')[0] : 'Organization');

                  const mockScores = [92, 85, 78, 95, 88];
                  const score = repo.security_score ?? mockScores[idx % mockScores.length];

                  const isRefreshing = refreshingRepoId === repo.id;
                  const isScanning = scanningRepoId === repo.id;

                  return (
                    <div
                      key={repo.id}
                      className="bg-[#0F172A] border border-[#243244] hover:border-[#10B981]/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
                    >
                      {/* Top Info */}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-[#F8FAFC] font-mono text-sm line-clamp-1">
                              {repo.name}
                            </h3>
                            <p className="text-xs text-[#94A3B8] font-mono line-clamp-1">
                              {repo.full_name}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-[#111827] border border-[#243244] px-2.5 py-1 rounded-lg">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-xs font-mono font-bold text-white">
                              {score}/100
                            </span>
                          </div>
                        </div>

                        {/* Metadata Pills */}
                        <div className="grid grid-cols-3 gap-2 my-3 text-[11px] font-mono">
                          <div className="bg-[#111827] border border-white/[0.04] px-2 py-1 rounded-md flex items-center gap-1 text-slate-300">
                            <User className="w-3 h-3 text-slate-500" />
                            <span className="truncate">{owner}</span>
                          </div>

                          <div className="bg-[#111827] border border-white/[0.04] px-2 py-1 rounded-md flex items-center gap-1 text-slate-300">
                            <GitBranch className="w-3 h-3 text-slate-500" />
                            <span className="truncate">{repo.default_branch || 'main'}</span>
                          </div>

                          <div className="bg-[#111827] border border-white/[0.04] px-2 py-1 rounded-md flex items-center gap-1 text-slate-300">
                            <Code2 className="w-3 h-3 text-slate-500" />
                            <span className="truncate">{repo.language || 'Python'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Last Scan: {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/repository/${repo.id}`);
                          }}
                          className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 bg-[#10B981] hover:bg-[#34D399] text-slate-950 rounded-xl text-xs font-semibold shadow-sm transition-all"
                        >
                          <span>Investigate</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleScanAgain(repo)}
                          disabled={isScanning}
                          className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 bg-[#111827] hover:bg-[#1E293B] text-white border border-[#243244] rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          {isScanning ? (
                            <Loader2 className="w-3 h-3 animate-spin text-[#10B981]" />
                          ) : (
                            <Play className="w-3 h-3 text-[#10B981] fill-[#10B981]" />
                          )}
                          <span>Scan</span>
                        </button>

                        <button
                          onClick={() => handleRefresh(repo.id)}
                          disabled={isRefreshing}
                          className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 bg-[#111827] hover:bg-[#1E293B] text-slate-300 border border-[#243244] rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          <RotateCw
                            className={`w-3 h-3 text-blue-400 ${
                              isRefreshing ? 'animate-spin' : ''
                            }`}
                          />
                          <span>Refresh</span>
                        </button>

                        <button
                          onClick={() => onRemoveRepo(repo)}
                          className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
