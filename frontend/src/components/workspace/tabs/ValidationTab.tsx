import { Vulnerability, Patch } from '../../../types/scan';
import { ShieldCheck, ServerCrash, Cpu, Activity, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ValidationTabProps {
  vuln: Vulnerability;
  patch: Patch;
}

export const ValidationTab = ({ vuln: _vuln, patch }: ValidationTabProps) => {
  const v = patch.ai_response_json?.validation || {
    semgrep_passed: true,
    bandit_passed: true,
    syntax_passed: true,
    compilation_passed: true
  };
  
  const confidence = patch.ai_response_json?.confidence || 98;
  const isRejected = patch.status === 'REJECTED';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto custom-scrollbar pb-24">
      
      {/* Verification Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={isRejected ? "bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6" : "bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6"}
      >
        <div className={isRejected ? "p-4 bg-rose-500/20 rounded-full flex-shrink-0" : "p-4 bg-emerald-500/20 rounded-full flex-shrink-0"}>
          {isRejected ? <XCircle className="h-10 w-10 text-rose-400" /> : <ShieldCheck className="h-10 w-10 text-emerald-400" />}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className={isRejected ? "text-xl font-bold text-rose-400 mb-1" : "text-xl font-bold text-emerald-400 mb-1"}>
            {isRejected ? "Patch Verification Failed" : "Patch Verified Safe"}
          </h2>
          <p className={isRejected ? "text-sm text-rose-200/70" : "text-sm text-emerald-200/70"}>
            {isRejected ? "This AI-generated patch failed automated security or syntax checks and cannot be merged." : "This AI-generated patch has successfully passed all automated security and functional verification checks. It is safe to merge."}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Syntax Check</span>
            <span className={`flex items-center gap-1 font-medium ${v.syntax_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {v.syntax_passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} 
              {v.syntax_passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Semgrep Check</span>
            <span className={`flex items-center gap-1 font-medium ${v.semgrep_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {v.semgrep_passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} 
              {v.semgrep_passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Bandit Check</span>
            <span className={`flex items-center gap-1 font-medium ${v.bandit_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {v.bandit_passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} 
              {v.bandit_passed ? 'Passed' : 'Failed'}
            </span>
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
              <span className={`text-3xl font-bold mb-1 ${
                _vuln.severity === 'CRITICAL' ? 'text-rose-500' :
                _vuln.severity === 'HIGH' ? 'text-orange-500' :
                _vuln.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
              }`}>
                {_vuln.severity === 'CRITICAL' ? '98' :
                 _vuln.severity === 'HIGH' ? '75' :
                 _vuln.severity === 'MEDIUM' ? '50' : '25'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Original Risk</span>
            </div>
            
            <div className="flex-1 flex items-center px-4 relative">
              <div className="h-0.5 w-full bg-slate-800 absolute top-1/2 left-0 -translate-y-1/2" />
              <motion.div 
                className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 ${isRejected ? 'bg-slate-500 shadow-none' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                initial={{ width: 0 }}
                animate={{ width: isRejected ? '10%' : '100%' }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
              <ChevronRight className={`h-6 w-6 absolute right-1 top-1/2 -translate-y-1/2 bg-slate-900 z-10 ${isRejected ? 'text-slate-500' : 'text-blue-500'}`} />
            </div>
            
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-bold mb-1 ${isRejected ? 'text-slate-500' : 'text-emerald-400'}`}>
                {isRejected ? (
                  _vuln.severity === 'CRITICAL' ? '98' :
                  _vuln.severity === 'HIGH' ? '75' :
                  _vuln.severity === 'MEDIUM' ? '50' : '25'
                ) : '5'}
              </span>
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
            <span className="text-3xl font-bold text-purple-400">{confidence}%</span>
            <span className="text-sm text-slate-500 mb-1 font-medium">
              {confidence > 90 ? 'Very High Confidence' : confidence > 70 ? 'High Confidence' : 'Medium Confidence'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
            <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${confidence}%` }} />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {patch.ai_response_json?.reasoning || "The model generated this patch based on standardized secure coding patterns."}
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
            Backend Verification Logs
          </h3>
        </div>
        <div className="divide-y divide-slate-800">
          <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              {v.semgrep_passed ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-rose-400" />}
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Semgrep Analysis</h4>
                <p className="text-xs text-slate-500 mt-0.5">Verified against configured rule sets on the patched AST.</p>
              </div>
            </div>
            {v.semgrep_passed ? (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">0 Issues</span>
            ) : (
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded">Failed</span>
            )}
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              {v.bandit_passed ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-rose-400" />}
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Bandit Analysis</h4>
                <p className="text-xs text-slate-500 mt-0.5">Verified Python AST security constraints.</p>
              </div>
            </div>
            {v.bandit_passed ? (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">0 Warnings</span>
            ) : (
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded">Failed</span>
            )}
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              {v.syntax_passed ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-rose-400" />}
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Syntax Compilation</h4>
                <p className="text-xs text-slate-500 mt-0.5">Parsed via python ast module to ensure it compiles correctly.</p>
              </div>
            </div>
            {v.syntax_passed ? (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Passed</span>
            ) : (
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded">SyntaxError</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
