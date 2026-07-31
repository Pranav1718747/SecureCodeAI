import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, AlertCircle, CheckCircle2, Settings, ShieldCheck } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import {
  fetchRepositories,
  removeRepository,
  refreshRepository,
} from '../store/repositorySlice';
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
    <div className="min-h-screen bg-[#070B16] text-[#F8FAFC] font-sans antialiased selection:bg-[#18E6A8]/20 selection:text-[#18E6A8]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-[#18E6A8] text-[#070B16] px-4 py-3 rounded-xl shadow-2xl shadow-[#18E6A8]/20 font-mono text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.36)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#18E6A8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18E6A8] animate-pulse" />
                Enterprise SOC Platform
              </span>
              <span className="text-xs font-mono text-[#64748B] border border-white/[0.06] bg-[#070B16]/50 px-2.5 py-0.5 rounded-full">
                v2.4.0 Active
              </span>
              <span className="text-xs font-mono text-[#18E6A8] border border-[#18E6A8]/20 bg-[#18E6A8]/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                AI Guard Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-3">
              Security Operations Center
            </h1>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
              Autonomous multi-agent threat analysis, vulnerability detection, and automated patch validation across connected repositories.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 z-10 w-full sm:w-auto">
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#151E2D] hover:bg-[#1E293B] text-[#F8FAFC] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-xl text-xs font-semibold font-mono transition-all duration-200"
            >
              <Settings className="w-4 h-4 text-[#94A3B8]" />
              <span>Manage</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] font-semibold font-mono text-xs rounded-xl shadow-lg shadow-[#18E6A8]/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Connect Repository</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-[#F05B68]/10 border border-[#F05B68]/20 text-[#F05B68] p-4 rounded-xl flex items-center gap-3 font-mono text-xs">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* 1. ROW 1: CHARTS & TELEMETRY (12-COL GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <SecurityScoreGauge />
            <AIPerformancePanel />
          </div>
          <div className="lg:col-span-4 h-full">
            <AttackHeatmap />
          </div>
        </div>

        {/* 2. ROW 2: AI PR TABLE & RISK REDUCTION (12-COL GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 h-full">
            <RecentPRsTable />
          </div>
          <div className="lg:col-span-4 h-full">
            <RiskReductionCard />
          </div>
        </div>

        {/* 3. ROW 3: REPOSITORIES & LIVE ACTIVITY FEED (12-COL GRID) */}
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

        {/* Repository Management Modals */}
        <AddRepositoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
          connectedRepositories={repositories}
        />

        <ManageRepositoriesModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          repositories={repositories}
          onRefreshRepo={handleRefreshRepo}
          onRemoveRepo={(repo) => setRepoToRemove(repo)}
        />

        <RemoveRepositoryModal
          isOpen={!!repoToRemove}
          repoName={repoToRemove?.name || null}
          onClose={() => setRepoToRemove(null)}
          onConfirm={handleConfirmRemove}
          isDeleting={isDeleting}
        />

      </div>
    </div>
  );
};
