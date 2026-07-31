import { useState } from 'react';
import { repositoryService } from '../../services/repositoryService';
import { Github, Plus, X, Loader2 } from 'lucide-react';

interface RepositoryUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RepositoryUploader: React.FC<RepositoryUploaderProps> = ({ isOpen, onClose, onSuccess }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let fullName = name;
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          fullName = `${pathParts[0]}/${pathParts[1].replace('.git', '')}`;
        }
      } catch (e) {
        // Ignore invalid URL
      }

      await repositoryService.addRepository({
        name,
        full_name: fullName,
        clone_url: url,
        default_branch: 'main',
        is_private: false,
        language: 'python'
      });
      
      onSuccess();
      onClose();
      setUrl('');
      setName('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to add repository');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09111F]/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Github className="h-5 w-5 text-[#10B981]" />
            Connect Repository
          </h2>
          <button 
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 rounded-lg hover:bg-[#0F172A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-mono">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Repository Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-xs focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/30 transition-all font-mono"
              placeholder="cricket-simulator"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Clone URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-xs focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/30 transition-all font-mono"
              placeholder="https://github.com/user/repo.git"
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.06] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#34D399] text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm shadow-[#10B981]/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Connect Repository
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
