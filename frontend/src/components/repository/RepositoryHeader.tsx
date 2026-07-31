import React from 'react';
import { motion } from 'framer-motion';
import { Github, Lock, Globe, Star, GitFork, ExternalLink, GitBranch, Terminal, ShieldCheck, Clock } from 'lucide-react';
import { Repository } from '../../types/repository';

interface RepositoryHeaderProps {
  repo: Repository;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({ repo }) => {
  const owner = repo.owner || (repo.full_name ? repo.full_name.split('/')[0] : 'Organization');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all duration-200 group"
    >
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#18E6A8]/5 rounded-full blur-3xl group-hover:bg-[#18E6A8]/10 transition-all pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Avatar, Name, Badges */}
        <div className="flex items-start gap-5">
          <div className="p-4 bg-[#151E2D] border border-white/[0.08] rounded-2xl shadow-inner group-hover:border-[#18E6A8]/30 flex-shrink-0 transition-colors">
            <Github className="h-9 w-9 text-slate-200 group-hover:text-[#18E6A8] transition-colors" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC] font-sans group-hover:text-[#18E6A8] transition-colors">
                {repo.name}
              </h1>

              {/* Visibility Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151E2D] border border-white/[0.08] text-[#94A3B8] text-xs font-mono font-medium rounded-full">
                {repo.is_private ? <Lock className="h-3 w-3 text-[#FBBF24]" /> : <Globe className="h-3 w-3 text-[#18E6A8]" />}
                {repo.is_private ? 'Private' : 'Public'}
              </span>

              {/* Health Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8] text-xs font-mono font-medium rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                Healthy
              </span>
            </div>

            {/* Owner & Clone URL */}
            <a
              href={repo.clone_url?.replace('.git', '') || '#'}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-[#94A3B8] hover:text-[#18E6A8] inline-flex items-center gap-1.5 transition-colors group/link"
            >
              <span>{owner} / {repo.name}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all" />
            </a>

            {/* Language & Stats Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono text-[#94A3B8]">
              {repo.language && (
                <div className="flex items-center gap-1.5 bg-[#151E2D] border border-white/[0.06] px-2.5 py-1 rounded-lg text-[#F8FAFC]">
                  <div className="w-2 h-2 rounded-full bg-[#18E6A8]" />
                  <span>{repo.language}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-[#151E2D] border border-white/[0.06] px-2.5 py-1 rounded-lg hover:text-[#F8FAFC] transition-colors cursor-default">
                <Star className="h-3.5 w-3.5 text-[#FBBF24]" />
                <span>124</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#151E2D] border border-white/[0.06] px-2.5 py-1 rounded-lg hover:text-[#F8FAFC] transition-colors cursor-default">
                <GitFork className="h-3.5 w-3.5 text-[#94A3B8]" />
                <span>28</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Branch Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-3 text-xs text-[#94A3B8] font-mono bg-[#151E2D]/80 p-4 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between gap-6">
            <span className="text-[#64748B]">Default Branch</span>
            <span className="flex items-center gap-1.5 text-[#F8FAFC] bg-[#111827] px-2.5 py-1 rounded-md border border-white/[0.08]">
              <GitBranch className="h-3.5 w-3.5 text-[#18E6A8]" />
              {repo.default_branch || 'main'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="text-[#64748B]">Latest Commit</span>
            <span className="flex items-center gap-1.5 text-[#F8FAFC] bg-[#111827] px-2.5 py-1 rounded-md border border-white/[0.08]">
              <Terminal className="h-3.5 w-3.5 text-[#94A3B8]" />
              8f92a1c
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 col-span-2 sm:col-span-1">
            <span className="text-[#64748B]">Last Scan</span>
            <span className="flex items-center gap-1.5 text-[#F8FAFC] bg-[#111827] px-2.5 py-1 rounded-md border border-white/[0.08]">
              <Clock className="h-3.5 w-3.5 text-[#18E6A8]" />
              {new Date(repo.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
