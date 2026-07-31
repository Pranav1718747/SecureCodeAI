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
      barColor: 'bg-[#10B981]',
    },
    {
      label: 'Validation Pass Rate',
      value: 98.2,
      unit: '%',
      icon: ShieldCheck,
      barColor: 'bg-[#10B981]',
    },
    {
      label: 'PR Success Rate',
      value: 94.0,
      unit: '%',
      icon: GitPullRequest,
      barColor: 'bg-[#34D399]',
    },
    {
      label: 'AI Confidence Score',
      value: 95.8,
      unit: '%',
      icon: Award,
      barColor: 'bg-[#10B981]',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:border-[#10B981]/30 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_10px_35px_rgba(16,185,129,0.08)] rounded-[20px] p-6 relative overflow-hidden flex flex-col justify-between h-full transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#10B981]" />
            AI Agent Performance
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1">Groq Multi-Agent Telemetry</p>
        </div>
        <span className="px-2.5 py-1 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] rounded-full text-xs font-mono font-medium">
          llama-3.3-70b
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0F172A] border border-[#243244] p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[#10B981]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Avg Fix Time</div>
            <div className="text-lg font-bold font-mono text-[#F8FAFC]">42s <span className="text-xs text-[#10B981] font-normal">(-14s)</span></div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-[#243244] p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[#10B981]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Resolved Flaws</div>
            <div className="text-lg font-bold font-mono text-[#F8FAFC]">142 <span className="text-xs text-[#10B981] font-normal">(100%)</span></div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {metrics.map((item, idx) => (
          <div key={item.label}>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[#F8FAFC] font-medium flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5 text-[#10B981]" />
                {item.label}
              </span>
              <span className="font-mono text-[#10B981] font-bold">
                {item.value}
                {item.unit}
              </span>
            </div>
            <div className="h-2 w-full bg-[#0F172A] rounded-full overflow-hidden border border-[#243244]">
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
