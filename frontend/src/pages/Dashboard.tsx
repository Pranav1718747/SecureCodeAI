import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import {
  fetchRepositories,
  removeRepository,
  refreshRepository,
} from '../store/repositorySlice';
import { Button } from '../components/Common';
import { Repository } from '../types/repository';

// SOC Subcomponents
import { SecurityScoreGauge } from '../components/SOC/SecurityScoreGauge';
import { AIPerformancePanel } from '../components/SOC/AIPerformancePanel';
import { AttackHeatmap } from '../components/SOC/AttackHeatmap';
import { ActivityFeed } from '../components/SOC/ActivityFeed';
import { RiskReductionCard } from '../components/SOC/RiskReductionCard';
import { RecentPRsTable } from '../components/SOC/RecentPRsTable';
import { ConnectedRepositories } from '../components/SOC/ConnectedRepositories';

// Repository Management Modals
import { AddRepositoryModal } from '../components/repository/AddRepositoryModal';
import { ManageRepositoriesModal } from '../components/repository/ManageRepositoriesModal';
import { RemoveRepositoryModal } from '../components/repository/RemoveRepositoryModal';

export const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { repositories, loading, error } = useSelector((state: RootState) => state.repositories);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [repoToRemove, setRepoToRemove] = useState<Repository | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddSuccess = (repoName: string) => {
    dispatch(fetchRepositories());
    showToast(`Repository "${repoName}" successfully connected.`);
  };

  const handleRefreshRepo = async (repoId: string) => {
    await dispatch(refreshRepository(repoId)).unwrap();
    dispatch(fetchRepositories());
    showToast('Repository data refreshed successfully.');
  };

  const handleConfirmRemove = async () => {
    if (!repoToRemove) return;
    setIsDeleting(true);
    try {
      await dispatch(removeRepository(repoToRemove.id)).unwrap();
      showToast(`Repository "${repoToRemove.name}" removed from SecureCodeAI.`);
      setRepoToRemove(null);
      dispatch(fetchRepositories());
    } catch (err: any) {
      alert(err || 'Failed to remove repository');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-8 pt-8 pb-12 space-y-12 animate-in fade-in duration-500 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl shadow-xl font-mono text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header (Enterprise SOC Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Enterprise SOC Platform
            </span>
            <span className="text-xs font-mono text-[#94A3B8]">v2.4.0 Active</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-3">
            Security Operations Center
            <span className="text-[#10B981] text-xs font-mono font-normal bg-[#111827] border border-[#243244] px-3 py-1 rounded-lg">
              AI Guard Engine
            </span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Autonomous multi-agent threat analysis, vulnerability detection, and automated patch validation across repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsManageModalOpen(true)}
            icon={Settings}
            className="bg-[#111827] hover:bg-[#1E293B] text-slate-200 border border-[#243244] font-semibold rounded-xl font-mono"
          >
            Manage
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            icon={Plus}
            className="bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-semibold shadow-sm shadow-[#10B981]/20 rounded-xl font-mono"
          >
            Connect Repository
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-xs font-mono">{error}</p>
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
            onAddRepo={() => setIsAddModalOpen(true)}
            onManageRepos={() => setIsManageModalOpen(true)}
          />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeed />
        </div>
      </div>

      {/* Add Repository Modal */}
      <AddRepositoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        connectedRepositories={repositories}
      />

      {/* Manage Repositories Modal */}
      <ManageRepositoriesModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        repositories={repositories}
        onRefreshRepo={handleRefreshRepo}
        onRemoveRepo={(repo) => setRepoToRemove(repo)}
      />

      {/* Remove Repository Confirmation Modal */}
      <RemoveRepositoryModal
        isOpen={!!repoToRemove}
        repoName={repoToRemove?.name || null}
        onClose={() => setRepoToRemove(null)}
        onConfirm={handleConfirmRemove}
        isDeleting={isDeleting}
      />
    </div>
  );
};
