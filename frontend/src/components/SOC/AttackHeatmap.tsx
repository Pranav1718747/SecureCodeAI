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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-slate-900/90 border border-slate-800/90 rounded-[18px] p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Attack Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-1">OWASP Top 10 & CWE Threat Ranking</p>
        </div>
        <span className="text-xs text-slate-500 font-mono">112 Threats</span>
      </div>

      <div className="space-y-3.5 my-auto">
        {categories.map((item, idx) => (
          <div key={item.category} className="group">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-200 font-medium flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  {item.cwe}
                </span>
                <span className="truncate max-w-[160px]">{item.category}</span>
              </span>
              <span className="font-mono text-slate-400 group-hover:text-emerald-400 transition-colors">
                <span className="font-bold text-white">{item.count}</span> ({item.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          SQLi & XSS represent 63% of threats
        </span>
      </div>
    </motion.div>
  );
};
