import { GitCommit, ShieldAlert, CheckCircle2, GitPullRequest } from 'lucide-react';

export const ActivityTimeline = () => {
  const activities = [
    { type: 'scan_completed', title: 'Deep Scan completed', time: '2 hours ago', icon: ShieldAlert, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { type: 'pr_created', title: 'Security Patch #42 created', time: '2 hours ago', icon: GitPullRequest, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'finding_fixed', title: 'SQL Injection resolved', time: 'Yesterday', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { type: 'commit', title: 'Commit 8f92a1c pushed', time: 'Yesterday', icon: GitCommit, color: 'text-slate-400', bg: 'bg-slate-800' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Recent Activity</h3>
      
      <div className="relative pl-3 space-y-6">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-800" />
        
        {activities.map((activity, idx) => (
          <div key={idx} className="relative flex gap-4">
            <div className={`w-2 h-2 rounded-full absolute -left-1.5 top-1.5 border-2 border-slate-900 ${activity.bg.replace('10', '40')} z-10`} />
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${activity.bg} ${activity.color} ml-3 z-10`}>
              <activity.icon className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{activity.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
