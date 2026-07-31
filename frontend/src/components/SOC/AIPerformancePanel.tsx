import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle, Zap, GitPullRequest, Award, ShieldCheck } from 'lucide-react';

export const AIPerformancePanel: React.FC = () => {
  const metrics = [
    {
      label: 'AI Patch Success Rate',
      value: 96.4,
      unit: '%',
      icon: CheckCircle,
      barColor: 'bg-emerald-500',
    },
    {
      label: 'Validation Pass Rate',
      value: 98.2,
      unit: '%',
      icon: ShieldCheck,
      barColor: 'bg-emerald-400',
    },
    {
      label: 'PR Success Rate',
      value: 94.0,
      unit: '%',
      icon: GitPullRequest,
      barColor: 'bg-teal-400',
    },
    {
      label: 'AI Confidence Score',
      value: 95.8,
      unit: '%',
      icon: Award,
      barColor: 'bg-emerald-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-slate-900/90 border border-slate-800/90 rounded-[18px] p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            AI Agent Performance
          </h3>
          <p className="text-xs text-slate-400 mt-1">Groq Multi-Agent Telemetry</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-medium">
          llama-3.3-70b
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Fix Time</div>
            <div className="text-lg font-bold font-mono text-white">42s <span className="text-xs text-emerald-400 font-normal">(-14s)</span></div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Resolved Flaws</div>
            <div className="text-lg font-bold font-mono text-white">142 <span className="text-xs text-emerald-400 font-normal">(100%)</span></div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {metrics.map((item, idx) => (
          <div key={item.label}>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                {item.label}
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {item.value}
                {item.unit}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
              <motion.div
                className={`h-full ${item.barColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1, delay: idx * 0.15 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
