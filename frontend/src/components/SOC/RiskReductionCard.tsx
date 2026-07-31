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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full transition-all duration-200"
    >
      {/* Section 1: Risk Comparison (Top) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2 font-sans">
              <TrendingDown className="w-5 h-5 text-[#18E6A8]" />
              AI Risk Reduction
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5 font-sans">Pre-Scan vs. Post-AI Patch Remediations</p>
          </div>
          <span className="px-2.5 py-1 bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8] rounded-full text-xs font-semibold font-mono">
            -85.7% Risk Drop
          </span>
        </div>

        {/* Before / After Transition Graphic */}
        <div className="bg-[#151E2D] border border-white/[0.06] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-around gap-3 text-center">
          {/* Risk Before */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-[#F05B68] uppercase tracking-wider mb-0.5 font-mono">
              Before
            </span>
            <span className="text-2xl font-bold font-mono text-[#F05B68]">84%</span>
            <span className="text-[10px] text-[#64748B] font-mono mt-0.5">112 Flaws</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center p-1.5 rounded-full bg-[#111827] border border-white/[0.08] text-[#18E6A8]">
            <ArrowRight className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
          </div>

          {/* Risk After */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-[#18E6A8] uppercase tracking-wider mb-0.5 font-mono">
              After AI
            </span>
            <span className="text-2xl font-bold font-mono text-[#18E6A8]">12%</span>
            <span className="text-[10px] text-[#64748B] font-mono mt-0.5">16 Lows</span>
          </div>
        </div>
      </div>

      {/* Section 2: Executive Insight (Center) */}
      <div className="my-auto pt-6 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5 uppercase tracking-wider font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#18E6A8]" />
            AI Executive Insight
          </h4>
          <span className="text-xs font-mono font-medium text-[#94A3B8]">
            Confidence: <span className="text-[#18E6A8] font-bold">98.4%</span>
          </span>
        </div>

        <ul className="space-y-2.5">
          {insights.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-[#94A3B8] font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#18E6A8] flex-shrink-0" />
              <span className="truncate">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 3: Footer Status (Bottom) */}
      <div className="mt-auto pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#94A3B8] font-sans">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#18E6A8]" />
          Autonomous Engine verified 142 vulnerabilities
        </span>
        <span className="font-mono text-xs text-[#18E6A8] font-semibold">Shield Active</span>
      </div>
    </motion.div>
  );
};
