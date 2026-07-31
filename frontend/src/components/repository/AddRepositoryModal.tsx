import React, { useState, useEffect } from 'react';
import { Github, Plus, X, Loader2, Search, Link2, Check, Lock, Globe, Code2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { repositoryService } from '../../services/repositoryService';
import { Repository, GitHubRepo } from '../../types/repository';

interface AddRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repoName: string) => void;
  connectedRepositories: Repository[];
}

export const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  connectedRepositories,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'github'>('url');
  
  // Method 1 state
  const [url, setUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Method 2 state
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [addingRepoFullName, setAddingRepoFullName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'github') {
      fetchGitHubRepos();
    }
  }, [isOpen, activeTab]);

  const fetchGitHubRepos = async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const repos = await repositoryService.getGitHubUserRepos();
      setGithubRepos(repos);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub repositories');
    } finally {
      setLoadingRepos(false);
    }
  };

  if (!isOpen) return null;

  const connectedFullNames = new Set(connectedRepositories.map((r) => r.full_name.toLowerCase()));

  // Method 1 Submit
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let repoName = customName.trim();
      let fullName = customName.trim();

      if (url) {
        try {
          const urlObj = new URL(url);
          const parts = urlObj.pathname.split('/').filter(Boolean);
          if (parts.length >= 2) {
            const owner = parts[0];
            const name = parts[1].replace('.git', '');
            fullName = `${owner}/${name}`;
            if (!repoName) repoName = name;
          } else if (parts.length === 1) {
            if (!repoName) repoName = parts[0].replace('.git', '');
          }
        } catch {
          // fallback to customName
        }
      }

      if (!repoName) {
        throw new Error('Please enter a repository name or valid GitHub URL.');
      }

      await repositoryService.addRepository({
        name: repoName,
        full_name: fullName || repoName,
        clone_url: url,
        default_branch: 'main',
        is_private: false,
        language: 'Python',
      });

      onSuccess(repoName);
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to add repository');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Method 2 Add
  const handleAddGitHubRepo = async (ghRepo: GitHubRepo) => {
    setAddingRepoFullName(ghRepo.full_name);
    setError(null);

    try {
      await repositoryService.addRepository({
        name: ghRepo.name,
        full_name: ghRepo.full_name,
        clone_url: ghRepo.clone_url,
        default_branch: ghRepo.default_branch || 'main',
        is_private: ghRepo.is_private,
        language: ghRepo.language || 'Python',
      });

      onSuccess(ghRepo.name);
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to add repository');
    } finally {
      setAddingRepoFullName(null);
    }
  };

  const resetForm = () => {
    setUrl('');
    setCustomName('');
    setSearchQuery('');
    setError(null);
  };

  // Filtered GitHub Repositories
  const filteredGitHubRepos = githubRepos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLang =
      selectedLanguage === 'ALL' ||
      (repo.language && repo.language.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSearch && matchesLang;
  });

  const availableLanguages = Array.from(
    new Set(githubRepos.map((r) => r.language).filter(Boolean))
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070B16]/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#111827] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#151E2D]/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#18E6A8]/10 border border-[#18E6A8]/20 rounded-xl text-[#18E6A8]">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#F8FAFC]">Add Repository</h2>
                <p className="text-xs text-[#94A3B8]">
                  Connect a repository to enable Security Operations scanning
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#151E2D] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] bg-[#151E2D]/30 px-6 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all font-mono ${
                activeTab === 'url'
                  ? 'border-[#18E6A8] text-[#18E6A8]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Method 1: Paste GitHub URL
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all font-mono ${
                activeTab === 'github'
                  ? 'border-[#18E6A8] text-[#18E6A8]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Github className="w-4 h-4" />
              Method 2: Search GitHub Account
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {error && (
              <div className="bg-[#F05B68]/10 border border-[#F05B68]/20 text-[#F05B68] p-3.5 rounded-xl text-xs font-mono">
                {error}
              </div>
            )}

            {activeTab === 'url' ? (
              /* Method 1: Paste URL */
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 uppercase font-mono">
                    GitHub Repository URL
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        try {
                          const urlObj = new URL(e.target.value);
                          const parts = urlObj.pathname.split('/').filter(Boolean);
                          if (parts.length >= 2) {
                            setCustomName(parts[1].replace('.git', ''));
                          }
                        } catch {}
                      }}
                      className="w-full bg-[#151E2D] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-[#F8FAFC] text-xs focus:outline-none focus:border-[#18E6A8]/50 focus:ring-1 focus:ring-[#18E6A8]/30 transition-all font-mono placeholder-[#64748B]"
                      placeholder="https://github.com/user/project"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1.5 font-mono">
                    Example: https://github.com/ClimateSync/climate-sync
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 uppercase font-mono">
                    Repository Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-[#151E2D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-xs focus:outline-none focus:border-[#18E6A8]/50 focus:ring-1 focus:ring-[#18E6A8]/30 transition-all font-mono placeholder-[#64748B]"
                    placeholder="project-name"
                  />
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-[#18E6A8]/20 transition-all disabled:opacity-50 font-mono"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#070B16]" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Add Repository</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Method 2: Search GitHub Account */
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by repo name or owner..."
                      className="w-full bg-[#151E2D] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#18E6A8]/50 transition-all font-mono"
                    />
                  </div>

                  {availableLanguages.length > 0 && (
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-[#151E2D] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                    >
                      <option value="ALL">All Languages</option>
                      {availableLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* List of GitHub repos */}
                {loadingRepos ? (
                  <div className="py-12 text-center text-xs text-[#94A3B8] space-y-2 font-mono">
                    <Loader2 className="w-6 h-6 animate-spin text-[#18E6A8] mx-auto" />
                    <p>Loading repositories from GitHub...</p>
                  </div>
                ) : filteredGitHubRepos.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#94A3B8] bg-[#151E2D]/50 rounded-2xl border border-dashed border-white/[0.08]">
                    <p className="font-mono">No matching repositories found.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {filteredGitHubRepos.map((repo) => {
                      const isAdded = connectedFullNames.has(repo.full_name.toLowerCase());
                      const isAdding = addingRepoFullName === repo.full_name;

                      return (
                        <div
                          key={repo.id}
                          className="flex items-center justify-between p-3.5 bg-[#151E2D] border border-white/[0.06] hover:border-[#18E6A8]/30 rounded-xl transition-all gap-4"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-[#F8FAFC] font-mono truncate">
                                {repo.name}
                              </h4>
                              {repo.is_private ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24]">
                                  <Lock className="w-2.5 h-2.5" />
                                  Private
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8]">
                                  <Globe className="w-2.5 h-2.5" />
                                  Public
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] font-mono">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-[#64748B]" />
                                {repo.owner}
                              </span>
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <Code2 className="w-3 h-3 text-[#64748B]" />
                                  {repo.language}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            {isAdded ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8]">
                                <Check className="w-3.5 h-3.5" />
                                Already Added
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAddGitHubRepo(repo)}
                                disabled={isAdding}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 font-mono"
                              >
                                {isAdding ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Adding...</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
