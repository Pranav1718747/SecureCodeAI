import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Github, Plus, GitBranch, Clock, AlertCircle } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import { fetchRepositories } from '../store/repositorySlice';
import { RepositoryUploader } from '../components/RepositoryUploader';
import { Button, Card, CardHeader, CardContent, Badge } from '../components/Common';
import { SeverityPieChart, TrendLineChart } from '../components/Charts';

export const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { repositories, loading, error } = useSelector((state: RootState) => state.repositories);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  // Mock data for charts (would come from an analytics endpoint in production)
  const severityData = [
    { name: 'CRITICAL', value: 12 },
    { name: 'HIGH', value: 25 },
    { name: 'MEDIUM', value: 45 },
    { name: 'LOW', value: 30 },
  ];

  const trendData = [
    { date: 'Mon', vulnerabilities: 20, fixed: 10 },
    { date: 'Tue', vulnerabilities: 35, fixed: 25 },
    { date: 'Wed', vulnerabilities: 25, fixed: 30 },
    { date: 'Thu', vulnerabilities: 40, fixed: 20 },
    { date: 'Fri', vulnerabilities: 15, fixed: 45 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400 mt-1">System-wide security posture and repository status</p>
        </div>
        <Button onClick={() => setIsUploaderOpen(true)} icon={Plus}>
          Add Repository
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Top Metrics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Vulnerability Severity" description="Across all indexed repositories" />
          <CardContent>
            <SeverityPieChart data={severityData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Remediation Trend" description="Vulnerabilities found vs. fixed (last 5 days)" />
          <CardContent>
            <TrendLineChart data={trendData} />
          </CardContent>
        </Card>
      </div>

      {/* Repositories List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Github className="h-5 w-5 text-slate-400" />
          Connected Repositories
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : repositories.length === 0 ? (
          <Card className="border-dashed border-slate-700 bg-slate-900/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Github className="h-12 w-12 text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No repositories connected</h3>
              <p className="text-slate-400 mb-6 max-w-sm">
                Connect your first GitHub repository to start scanning for vulnerabilities and generating AI patches.
              </p>
              <Button onClick={() => setIsUploaderOpen(true)} variant="secondary" icon={Plus}>
                Connect Repository
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <Link
                to={`/repository/${repo.id}`}
                key={repo.id}
                className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Github className="h-5 w-5 text-slate-300 group-hover:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {repo.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{repo.full_name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-5">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                    <span>{repo.default_branch}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-4">
                  <Badge>{repo.language}</Badge>
                  <Badge variant={repo.ast_index_status === 'INDEXED' ? 'success' : repo.ast_index_status === 'INDEXING' ? 'warning' : 'default'}>
                    {repo.ast_index_status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <RepositoryUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSuccess={() => dispatch(fetchRepositories())}
      />
    </div>
  );
};
