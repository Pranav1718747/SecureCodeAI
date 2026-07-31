import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingDown, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const RiskReductionCard: React.FC = () => {
  const insights = [
    'Critical attack paths eliminated',
    'Validation passed on generated patches',
    'Security posture improved from High Risk to Low Risk',
    'Repository ready for Pull Request review',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-slate-900/90 border border-slate-800/90 rounded-[18px] p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-full"
    >
      {/* Section 1: Risk Comparison (Top) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              AI Risk Reduction
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pre-Scan vs. Post-AI Patch Remediations</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold font-mono">
            -85.7% Risk Drop
          </span>
        </div>

        {/* Before / After Transition Graphic */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-around gap-3 text-center">
          {/* Risk Before */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-0.5">
              Before
            </span>
            <span className="text-2xl font-bold font-mono text-red-400">84%</span>
            <span className="text-[10px] text-slate-400 mt-0.5">112 Flaws</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center p-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
            <ArrowRight className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
          </div>

          {/* Risk After */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
              After AI
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400">12%</span>
            <span className="text-[10px] text-slate-400 mt-0.5">16 Lows</span>
          </div>
        </div>
      </div>

      {/* Section 2: Executive Insight (Center - Vertically Centered) */}
      <div className="my-auto pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI Executive Insight
          </h4>
          <span className="text-xs font-mono font-medium text-slate-400">
            Confidence: <span className="text-emerald-400 font-bold">98.4%</span>
          </span>
        </div>

        <ul className="space-y-3">
          {insights.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3: Footer Status (Bottom - Pinned via mt-auto) */}
      <div className="mt-auto pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Autonomous Engine verified 142 vulnerabilities
        </span>
        <span className="font-mono text-xs text-emerald-400 font-semibold">Shield Active</span>
      </div>
    </motion.div>
  );
};
