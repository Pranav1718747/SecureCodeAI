import React from 'react';
import { GitCommit, ShieldAlert, CheckCircle2, GitPullRequest, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ActivityItem {
  id?: string;
  type: string;
  title: string;
  time: string;
  icon?: any;
  color?: string;
  bg?: string;
}

interface ActivityTimelineProps {
  customActivities?: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ customActivities }) => {
  const defaultActivities: ActivityItem[] = [
    {
      type: 'scan_completed',
      title: 'Deep Scan completed',
      time: '2 hours ago',
      icon: ShieldAlert,
      color: 'text-[#18E6A8]',
      bg: 'bg-[#18E6A8]/10 border-[#18E6A8]/20',
    },
    {
      type: 'pr_created',
      title: 'Security Patch #42 created',
      time: '2 hours ago',
      icon: GitPullRequest,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      type: 'finding_fixed',
      title: 'SQL Injection resolved',
      time: 'Yesterday',
      icon: CheckCircle2,
      color: 'text-[#18E6A8]',
      bg: 'bg-[#18E6A8]/10 border-[#18E6A8]/20',
    },
    {
      type: 'commit',
      title: 'Commit 8f92a1c pushed',
      time: 'Yesterday',
      icon: GitCommit,
      color: 'text-[#94A3B8]',
      bg: 'bg-[#151E2D] border-white/[0.08]',
    },
  ];

  const activities = customActivities && customActivities.length > 0 ? customActivities : defaultActivities;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200"
    >
      <h3 className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider mb-6">
        Recent Activity
      </h3>

      <div className="relative pl-3 space-y-4">
        {/* Vertical Timeline Connector Line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-[1.5px] bg-white/[0.08]" />

        {activities.map((activity, idx) => {
          const IconComp = activity.icon || Activity;
          const colorClass = activity.color || 'text-[#18E6A8]';
          const bgClass = activity.bg || 'bg-[#18E6A8]/10 border-[#18E6A8]/20';

          return (
            <motion.div
              key={activity.id || idx}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ x: 3, transition: { duration: 0.2 } }}
              className="relative flex items-start gap-4 p-2.5 rounded-xl hover:bg-[#151E2D] border border-transparent hover:border-white/[0.06] transition-all duration-200 group cursor-default"
            >
              <div className="w-2.5 h-2.5 rounded-full absolute -left-[5px] top-3.5 border-2 border-[#111827] bg-[#18E6A8] z-10" />

              <div
                className={`p-2 rounded-xl flex-shrink-0 border ${bgClass} ${colorClass} ml-3 z-10 transition-transform duration-200 group-hover:scale-110`}
              >
                <IconComp className="h-3.5 w-3.5" />
              </div>

              <div className="font-sans min-w-0 flex-1">
                <p className="text-xs font-medium text-[#F8FAFC] group-hover:text-[#18E6A8] transition-colors leading-tight truncate">
                  {activity.title}
                </p>
                <p className="text-[11px] text-[#64748B] font-mono mt-1">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
