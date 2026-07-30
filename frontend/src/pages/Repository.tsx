import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repositoryService } from '../services/repositoryService';
import { scanService } from '../services/scanService';
import { Repository } from '../types/repository';
import { Scan } from '../types/scan';
import { Github, Play, GitBranch, Clock, AlertCircle, ShieldAlert, Loader2, Search } from 'lucide-react';

export const RepositoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      const [repoData, scansData] = await Promise.all([
        repositoryService.getRepository(id),
        scanService.getScans(id)
      ]);
      setRepo(repoData);
      setScans(scansData.results);
    } catch (err: any) {
      setError(err.message || 'Failed to load repository details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerScan = async () => {
    try {
      if (!id) return;
      setIsScanning(true);
      await scanService.triggerScan(id);
      await fetchData(); // Refresh list to show new QUEUED scan
    } catch (err: any) {
      alert(err.message || 'Failed to trigger scan');
    } finally {
      setIsScanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-md flex items-center gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>{error || 'Repository not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Github className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{repo.name}</h1>
            <a 
              href={repo.clone_url.replace('.git', '')} 
              target="_blank" 
              rel="noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {repo.full_name}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <GitBranch className="h-4 w-4" />
              <span>{repo.default_branch}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {repo.language}
            </div>
          </div>
          <button 
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
            Run AI Scan
          </button>
        </div>
      </div>

      {/* Scans List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-slate-400" />
          Security Scans
        </h2>
        
        {scans.length === 0 ? (
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
            <ShieldAlert className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No scans found</h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              Run an AI security scan to analyze this repository for vulnerabilities.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
            {scans.map((scan) => (
              <Link 
                key={scan.id} 
                to={`/review/${scan.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    scan.status === 'COMPLETED' ? 'bg-emerald-900/50 text-emerald-400' :
                    scan.status === 'IN_PROGRESS' ? 'bg-blue-900/50 text-blue-400 animate-pulse' :
                    scan.status === 'FAILED' ? 'bg-red-900/50 text-red-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {scan.status === 'IN_PROGRESS' ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                      Scan #{scan.id.split('-')[0]}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {scan.branch_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs">Vulnerabilities</span>
                    <span className={`font-semibold ${scan.total_vulnerabilities > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                      {scan.status === 'COMPLETED' ? scan.total_vulnerabilities : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs">Status</span>
                    <span className="font-medium text-slate-300">{scan.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
