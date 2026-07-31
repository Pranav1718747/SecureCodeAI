import { Github, Lock, Globe, Star, GitFork, ExternalLink, GitBranch, Terminal } from 'lucide-react';
import { Repository } from '../../types/repository';

interface RepositoryHeaderProps {
  repo: Repository;
}

export const RepositoryHeader = ({ repo }: RepositoryHeaderProps) => {
  return (
    <div className="bg-[#0e1324]/50 border border-slate-800 p-6 rounded-xl relative overflow-hidden backdrop-blur-sm">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
        <div className="flex gap-5 items-start">
          <div className="p-4 bg-slate-900 border border-slate-700/50 rounded-xl shadow-inner">
            <Github className="h-10 w-10 text-slate-200" />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-serif italic text-white tracking-tight">{repo.name}</h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium rounded-full mt-1">
                {repo.is_private ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                {repo.is_private ? 'Private' : 'Public'}
              </span>
            </div>
            
            <a 
              href={repo.clone_url.replace('.git', '')} 
              target="_blank" 
              rel="noreferrer"
              className="font-mono text-sm text-slate-400 hover:text-brand-400 flex items-center gap-1.5 transition-colors group"
            >
              {repo.full_name}
              <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all" />
            </a>
            
            <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-400">
              {repo.language && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  {repo.language}
                </div>
              )}
              <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-default">
                <Star className="h-3.5 w-3.5" />
                124 {/* Mocked */}
              </div>
              <div className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-default">
                <GitFork className="h-3.5 w-3.5" />
                28 {/* Mocked */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-2 text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
          <div className="flex items-center justify-between w-full md:w-auto gap-8">
            <span className="text-slate-500">Default Branch</span>
            <span className="flex items-center gap-1.5 text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono text-xs">
              <GitBranch className="h-3.5 w-3.5 text-slate-400" />
              {repo.default_branch || 'main'}
            </span>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-8">
            <span className="text-slate-500">Latest Commit</span>
            <span className="flex items-center gap-1.5 text-slate-200 font-mono text-xs">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              8f92a1c {/* Mocked */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
