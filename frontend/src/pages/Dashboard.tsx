import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, AlertCircle } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import { fetchRepositories } from '../store/repositorySlice';
import { RepositoryUploader } from '../components/RepositoryUploader';
import { Button } from '../components/Common';

// SOC Subcomponents
import { SecurityScoreGauge } from '../components/SOC/SecurityScoreGauge';
import { AIPerformancePanel } from '../components/SOC/AIPerformancePanel';
import { AttackHeatmap } from '../components/SOC/AttackHeatmap';
import { ActivityFeed } from '../components/SOC/ActivityFeed';
import { RiskReductionCard } from '../components/SOC/RiskReductionCard';
import { RecentPRsTable } from '../components/SOC/RecentPRsTable';
import { ConnectedRepositories } from '../components/SOC/ConnectedRepositories';

export const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { repositories, loading, error } = useSelector((state: RootState) => state.repositories);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 pt-8 pb-12 space-y-12 animate-in fade-in duration-500">
      {/* 1. Page Header (GitHub Enterprise Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Enterprise SOC Platform
            </span>
            <span className="text-xs font-mono text-slate-500">v2.4.0 Active</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Security Operations Center
            <span className="text-emerald-400 text-xs font-mono font-normal bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
              AI Guard Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous multi-agent threat analysis, vulnerability detection, and automated patch validation across repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsUploaderOpen(true)}
            icon={Plus}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 rounded-xl"
          >
            Connect Repository
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* 2. ROW 1: CHARTS & ANALYTICS (12-COL GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <SecurityScoreGauge />
          <AIPerformancePanel />
        </div>
        <div className="lg:col-span-4 h-full">
          <AttackHeatmap />
        </div>
      </div>

      {/* 3. ROW 2: AI PR TABLE & RISK REDUCTION (12-COL GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 h-full">
          <RecentPRsTable />
        </div>
        <div className="lg:col-span-4 h-full">
          <RiskReductionCard />
        </div>
      </div>

      {/* 4. ROW 3: CONNECTED REPOSITORIES & LIVE SOC ACTIVITY FEED (12-COL GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <ConnectedRepositories
            repositories={repositories}
            loading={loading}
            onAddRepo={() => setIsUploaderOpen(true)}
          />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeed />
        </div>
      </div>

      {/* Repository Uploader Modal */}
      <RepositoryUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSuccess={() => dispatch(fetchRepositories())}
      />
    </div>
  );
};
