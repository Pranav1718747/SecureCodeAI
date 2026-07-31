import { motion } from 'framer-motion';
import { Code2, GitMerge, ShieldCheck, Crosshair, GitPullRequest } from 'lucide-react';

export type TabType = 'code' | 'patch' | 'validation' | 'simulation' | 'pr';

interface WorkspaceTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasPatch: boolean;
  hasPR: boolean;
}

export const WorkspaceTabs = ({ activeTab, onTabChange, hasPatch, hasPR }: WorkspaceTabsProps) => {
  const tabs = [
    { id: 'code' as TabType, label: 'Vulnerable Code', icon: Code2 },
    { id: 'patch' as TabType, label: 'AI Patch', icon: GitMerge, disabled: !hasPatch },
    { id: 'validation' as TabType, label: 'Validation', icon: ShieldCheck, disabled: !hasPatch },
    { id: 'simulation' as TabType, label: 'Attack Simulation', icon: Crosshair, disabled: !hasPatch },
    { id: 'pr' as TabType, label: 'Pull Request', icon: GitPullRequest, disabled: !hasPR },
  ];

  return (
    <div className="flex items-center gap-1 bg-[#111827] px-6 pt-2.5 border-b border-white/[0.08] sticky top-0 z-10 font-sans">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all ${
              isActive
                ? 'text-[#18E6A8]'
                : isDisabled
                  ? 'text-[#64748B] cursor-not-allowed'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] rounded-t-xl'
            }`}
          >
            <tab.icon className={`h-4 w-4 ${isActive ? 'text-[#18E6A8]' : isDisabled ? 'text-[#64748B]' : 'text-[#94A3B8]'}`} />
            <span>{tab.label}</span>

            {isActive && (
              <motion.div
                layoutId="activeWorkspaceTab"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#18E6A8] shadow-[0_0_10px_rgba(24,230,168,0.5)]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
