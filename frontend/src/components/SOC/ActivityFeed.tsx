import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, Cpu, CheckCircle2, GitPullRequest, GitBranch } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'scan' | 'detection' | 'patch' | 'validation' | 'branch' | 'pr';
  title: string;
  repo: string;
  timestamp: string;
  status: 'passed' | 'warning' | 'info';
}

export const ActivityFeed: React.FC = () => {
  const events: ActivityItem[] = [
    {
      id: '1',
      type: 'pr',
      title: 'Pull Request #42 opened: Fix SQL Injection in auth_service.py',
      repo: 'backend-api',
      timestamp: '2 mins ago',
      status: 'passed',
    },
    {
      id: '2',
      type: 'validation',
      title: 'Dynamic Validation Passed (Semgrep + Bandit 100% clean)',
      repo: 'backend-api',
      timestamp: '3 mins ago',
      status: 'passed',
    },
    {
      id: '3',
      type: 'patch',
      title: 'Groq AI Agent generated automated patch for CWE-89',
      repo: 'backend-api',
      timestamp: '4 mins ago',
      status: 'info',
    },
    {
      id: '4',
      type: 'detection',
      title: 'SQL Injection detected in login_view() line 45',
      repo: 'backend-api',
      timestamp: '5 mins ago',
      status: 'warning',
    },
    {
      id: '5',
      type: 'scan',
      title: 'AST Repository Scan Completed (2,410 files indexed)',
      repo: 'frontend-web',
      timestamp: '12 mins ago',
      status: 'passed',
    },
  ];

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'pr':
        return <GitPullRequest className="w-4 h-4 text-[#10B981]" />;
      case 'validation':
        return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
      case 'patch':
        return <Cpu className="w-4 h-4 text-[#34D399]" />;
      case 'detection':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'branch':
        return <GitBranch className="w-4 h-4 text-[#10B981]" />;
      case 'scan':
        return <ShieldCheck className="w-4 h-4 text-[#10B981]" />;
      default:
        return <Activity className="w-4 h-4 text-[#94A3B8]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6 sticky top-6 max-h-[80vh] overflow-y-auto flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#10B981] animate-pulse" />
              Live SOC Activity
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">Real-time AI security operations</p>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            LIVE
          </span>
        </div>

        <div className="space-y-3">
          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="flex items-start gap-3 p-3 bg-[#0F172A] border border-[#243244] rounded-xl hover:border-[#10B981]/30 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-[#111827] border border-[#243244] mt-0.5">
                {getIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 font-medium line-clamp-2">{event.title}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#94A3B8] font-mono">
                  <span className="text-[#10B981] font-semibold font-mono">{event.repo}</span>
                  <span>•</span>
                  <span className="font-mono">{event.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
        <span className="text-xs text-[#94A3B8] hover:text-[#10B981] cursor-pointer transition-colors font-medium">
          View full audit trail logs →
        </span>
      </div>
    </motion.div>
  );
};
