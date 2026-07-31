import { motion } from 'framer-motion';
import { Code2, GitMerge, ShieldCheck } from 'lucide-react';

import { GitPullRequest } from 'lucide-react';

export type TabType = 'code' | 'patch' | 'validation' | 'pr';

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
    { id: 'pr' as TabType, label: 'Pull Request', icon: GitPullRequest, disabled: !hasPR },
  ];

  return (
    <div className="flex items-center gap-1 bg-[#0a0f1c] px-4 pt-2 border-b border-slate-800 sticky top-0 z-10">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;
        
        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive 
                ? 'text-blue-400' 
                : isDisabled 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            <tab.icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : isDisabled ? 'text-slate-700' : 'text-slate-500'}`} />
            {tab.label}
            
            {isActive && (
              <motion.div
                layoutId="activeWorkspaceTab"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
