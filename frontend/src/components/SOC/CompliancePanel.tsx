import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Lock } from 'lucide-react';

interface Framework {
  name: string;
  code: string;
  progress: number;
  status: 'COMPLIANT' | 'NEEDS_ATTENTION' | 'IN_PROGRESS';
  description: string;
}

export const CompliancePanel: React.FC = () => {
  const frameworks: Framework[] = [
    {
      name: 'OWASP Top 10',
      code: 'OWASP-2021',
      progress: 96,
      status: 'COMPLIANT',
      description: 'Web Application Security Standard',
    },
    {
      name: 'SOC 2 Type II',
      code: 'SOC2-CC6',
      progress: 92,
      status: 'COMPLIANT',
      description: 'Security & Confidentiality Controls',
    },
    {
      name: 'PCI-DSS v4.0',
      code: 'PCI-6.5',
      progress: 88,
      status: 'COMPLIANT',
      description: 'Payment Security & Code Audits',
    },
    {
      name: 'ISO 27001',
      code: 'A.14.2',
      progress: 94,
      status: 'COMPLIANT',
      description: 'Security in Dev & Support Processes',
    },
    {
      name: 'GDPR Data Guard',
      code: 'ART-32',
      progress: 95,
      status: 'COMPLIANT',
      description: 'Technical Data Protection Controls',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            Compliance & Regulatory Readiness
          </h3>
          <p className="text-xs text-slate-400">Automated Audit & Compliance Framework Mapping</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
          Audit-Ready
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 my-auto">
        {frameworks.map((fw, idx) => (
          <motion.div
            key={fw.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            whileHover={{ y: -3 }}
            className="bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 p-4 rounded-xl flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {fw.code}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">
                {fw.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{fw.description}</p>
            </div>

            <div className="mt-4 pt-2">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-400">Readiness</span>
                <span className="text-emerald-400 font-bold">{fw.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${fw.progress}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Continuous compliance verification active for all 5 enterprise frameworks
        </span>
        <span className="text-slate-500 font-mono">SOC Report Available</span>
      </div>
    </div>
  );
};
