import React from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldAlert } from 'lucide-react';

interface CategoryItem {
  category: string;
  count: number;
  percentage: number;
  cwe: string;
}

export const AttackHeatmap: React.FC = () => {
  const categories: CategoryItem[] = [
    { category: 'SQL Injection', count: 42, percentage: 38, cwe: 'CWE-89' },
    { category: 'XSS (Cross-Site Scripting)', count: 28, percentage: 25, cwe: 'CWE-79' },
    { category: 'Hardcoded Credentials', count: 18, percentage: 16, cwe: 'CWE-798' },
    { category: 'Command Injection', count: 11, percentage: 10, cwe: 'CWE-78' },
    { category: 'SSRF (Server-Side)', count: 7, percentage: 6, cwe: 'CWE-918' },
    { category: 'Path Traversal', count: 4, percentage: 3, cwe: 'CWE-22' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2 font-sans">
            <Flame className="w-5 h-5 text-[#18E6A8]" />
            Attack Heatmap
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1 font-sans">OWASP Top 10 & CWE Threat Ranking</p>
        </div>
        <span className="text-xs text-[#94A3B8] font-mono">112 Threats</span>
      </div>

      {/* List */}
      <div className="space-y-3.5 my-auto">
        {categories.map((item, idx) => (
          <div key={item.category} className="group">
            <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
              <span className="text-[#F8FAFC] font-medium flex items-center gap-2 group-hover:text-[#18E6A8] transition-colors">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151E2D] border border-white/[0.06] text-[#94A3B8]">
                  {item.cwe}
                </span>
                <span className="truncate max-w-[170px]">{item.category}</span>
              </span>
              <span className="font-mono text-[#94A3B8] group-hover:text-[#18E6A8] transition-colors text-[11px]">
                <span className="font-bold text-[#F8FAFC]">{item.count}</span> ({item.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full bg-[#151E2D] rounded-full overflow-hidden border border-white/[0.06]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#18E6A8] to-[#34D399] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#94A3B8] font-sans">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#FBBF24]" />
          SQLi & XSS represent 63% of threats
        </span>
      </div>
    </motion.div>
  );
};
