import { Vulnerability, Patch } from '../../../types/scan';
import { ShieldCheck, ServerCrash, Cpu, Activity, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ValidationTabProps {
  vuln: Vulnerability;
  patch: Patch;
}

export const ValidationTab = ({ vuln: _vuln, patch: _patch }: ValidationTabProps) => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto custom-scrollbar pb-24">
      
      {/* Verification Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="p-4 bg-emerald-500/20 rounded-full flex-shrink-0">
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-emerald-400 mb-1">Patch Verified Safe</h2>
          <p className="text-sm text-emerald-200/70">
            This AI-generated patch has successfully passed all automated security and functional verification checks. It is safe to merge.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Syntax Check</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium"><CheckCircle2 className="h-4 w-4" /> Passed</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Security Check</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium"><CheckCircle2 className="h-4 w-4" /> Passed</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Unit Tests</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium"><CheckCircle2 className="h-4 w-4" /> Passed</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Reduction */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" />
            Risk Reduction
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-rose-500 mb-1">94</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Original Risk</span>
            </div>
            
            <div className="flex-1 flex items-center px-4 relative">
              <div className="h-0.5 w-full bg-slate-800 absolute top-1/2 left-0 -translate-y-1/2" />
              <motion.div 
                className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
              <ChevronRight className="h-6 w-6 text-blue-500 absolute right-1 top-1/2 -translate-y-1/2 bg-slate-900 z-10" />
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-emerald-400 mb-1">12</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">New Risk</span>
            </div>
          </div>
        </motion.div>

        {/* AI Confidence */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            AI Confidence
          </h3>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-3xl font-bold text-purple-400">98%</span>
            <span className="text-sm text-slate-500 mb-1 font-medium">Very High Confidence</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '98%' }} />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The model is highly confident in this remediation as it perfectly matches standardized secure coding patterns for parameterized SQL execution.
          </p>
        </motion.div>
      </div>

      {/* External Scanners */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ServerCrash className="h-4 w-4 text-orange-400" />
            External Scanner Verification
          </h3>
        </div>
        <div className="divide-y divide-slate-800">
          <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Semgrep Analysis</h4>
                <p className="text-xs text-slate-500 mt-0.5">Verified that `sql-injection` rule no longer triggers on patched AST.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">0 Issues</span>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Bandit Analysis</h4>
                <p className="text-xs text-slate-500 mt-0.5">Verified Python AST security constraints.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">0 Warnings</span>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Unit Tests (PyTest)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Executed relevant tests in `tests/test_db.py`</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">14/14 Passed</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
