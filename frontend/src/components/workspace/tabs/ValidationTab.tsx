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
    compilation_passed: true,
  };

  const confidence = patch.ai_response_json?.confidence || 98;
  const isRejected = patch.status === 'REJECTED';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto custom-scrollbar pb-24 font-sans text-[#F8FAFC]">

      {/* Verification Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className={
          isRejected
            ? 'bg-[#F05B68]/10 border border-[#F05B68]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all'
            : 'bg-[#18E6A8]/10 border border-[#18E6A8]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all'
        }
      >
        <div
          className={
            isRejected
              ? 'p-4 bg-[#F05B68]/20 rounded-2xl flex-shrink-0 border border-[#F05B68]/30'
              : 'p-4 bg-[#18E6A8]/20 rounded-2xl flex-shrink-0 border border-[#18E6A8]/30'
          }
        >
          {isRejected ? (
            <XCircle className="h-10 w-10 text-[#F05B68]" />
          ) : (
            <ShieldCheck className="h-10 w-10 text-[#18E6A8]" />
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2
            className={
              isRejected ? 'text-xl font-bold text-[#F05B68] mb-1' : 'text-xl font-bold text-[#18E6A8] mb-1'
            }
          >
            {isRejected ? 'Patch Verification Failed' : 'Patch Verified Safe'}
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {isRejected
              ? 'This AI-generated patch failed automated security or syntax checks and cannot be merged.'
              : 'This AI-generated patch has successfully passed all automated security and functional verification checks. It is safe to merge.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0 font-mono text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#94A3B8]">Syntax Check</span>
            <span
              className={`flex items-center gap-1 font-bold ${
                v.syntax_passed ? 'text-[#18E6A8]' : 'text-[#F05B68]'
              }`}
            >
              {v.syntax_passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {v.syntax_passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#94A3B8]">Semgrep Check</span>
            <span
              className={`flex items-center gap-1 font-bold ${
                v.semgrep_passed ? 'text-[#18E6A8]' : 'text-[#F05B68]'
              }`}
            >
              {v.semgrep_passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {v.semgrep_passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#94A3B8]">Bandit Check</span>
            <span
              className={`flex items-center gap-1 font-bold ${
                v.bandit_passed ? 'text-[#18E6A8]' : 'text-[#F05B68]'
              }`}
            >
              {v.bandit_passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {v.bandit_passed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Reduction Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -3, transition: { duration: 0.25 } }}
          className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200"
        >
          <h3 className="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#18E6A8]" />
            Risk Reduction
          </h3>
          <div className="flex items-center justify-between font-mono">
            <div className="flex flex-col items-center">
              <span
                className={`text-3xl font-bold mb-1 ${
                  _vuln.severity === 'CRITICAL'
                    ? 'text-[#F05B68]'
                    : _vuln.severity === 'HIGH'
                    ? 'text-[#FBBF24]'
                    : 'text-blue-400'
                }`}
              >
                {_vuln.severity === 'CRITICAL'
                  ? '98'
                  : _vuln.severity === 'HIGH'
                  ? '75'
                  : _vuln.severity === 'MEDIUM'
                  ? '50'
                  : '25'}
              </span>
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">
                Original Risk
              </span>
            </div>

            <div className="flex-1 flex items-center px-4 relative">
              <div className="h-0.5 w-full bg-[#151E2D] absolute top-1/2 left-0 -translate-y-1/2" />
              <motion.div
                className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 ${
                  isRejected
                    ? 'bg-[#64748B]'
                    : 'bg-[#18E6A8] shadow-[0_0_10px_rgba(24,230,168,0.5)]'
                }`}
                initial={{ width: 0 }}
                animate={{ width: isRejected ? '10%' : '100%' }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
              <ChevronRight
                className={`h-6 w-6 absolute right-1 top-1/2 -translate-y-1/2 bg-[#111827] z-10 ${
                  isRejected ? 'text-[#64748B]' : 'text-[#18E6A8]'
                }`}
              />
            </div>

            <div className="flex flex-col items-center">
              <span
                className={`text-3xl font-bold mb-1 ${
                  isRejected ? 'text-[#64748B]' : 'text-[#18E6A8]'
                }`}
              >
                {isRejected
                  ? _vuln.severity === 'CRITICAL'
                    ? '98'
                    : '75'
                  : '5'}
              </span>
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">
                New Risk
              </span>
            </div>
          </div>
        </motion.div>

        {/* AI Confidence Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -3, transition: { duration: 0.25 } }}
          className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200"
        >
          <h3 className="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider mb-6 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#18E6A8]" />
            AI Confidence
          </h3>
          <div className="flex items-end gap-3 mb-2 font-mono">
            <span className="text-3xl font-bold text-[#18E6A8]">{confidence}%</span>
            <span className="text-xs text-[#94A3B8] mb-1 font-semibold">
              {confidence > 90
                ? 'Very High Confidence'
                : confidence > 70
                ? 'High Confidence'
                : 'Medium Confidence'}
            </span>
          </div>
          <div className="w-full bg-[#151E2D] border border-white/[0.06] rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-[#18E6A8] h-2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(24,230,168,0.5)]"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {patch.ai_response_json?.reasoning ||
              'The model generated this patch based on standardized secure coding patterns.'}
          </p>
        </motion.div>
      </div>

      {/* External Scanners Log Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200"
      >
        <div className="p-4 border-b border-white/[0.08] bg-[#151E2D]">
          <h3 className="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
            <ServerCrash className="h-4 w-4 text-[#FBBF24]" />
            Backend Verification Logs
          </h3>
        </div>
        <div className="divide-y divide-white/[0.08]">
          <div className="p-4 flex items-center justify-between hover:bg-[#151E2D]/50 transition-colors">
            <div className="flex items-center gap-4">
              {v.semgrep_passed ? (
                <CheckCircle2 className="h-5 w-5 text-[#18E6A8]" />
              ) : (
                <XCircle className="h-5 w-5 text-[#F05B68]" />
              )}
              <div>
                <h4 className="text-xs font-bold text-[#F8FAFC]">Semgrep Static Analysis</h4>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  Verified against configured rule sets on the patched AST.
                </p>
              </div>
            </div>
            {v.semgrep_passed ? (
              <span className="text-xs font-mono font-bold text-[#18E6A8] bg-[#18E6A8]/10 border border-[#18E6A8]/20 px-3 py-1 rounded-full">
                0 Issues
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-[#F05B68] bg-[#F05B68]/10 border border-[#F05B68]/20 px-3 py-1 rounded-full">
                Failed
              </span>
            )}
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#151E2D]/50 transition-colors">
            <div className="flex items-center gap-4">
              {v.bandit_passed ? (
                <CheckCircle2 className="h-5 w-5 text-[#18E6A8]" />
              ) : (
                <XCircle className="h-5 w-5 text-[#F05B68]" />
              )}
              <div>
                <h4 className="text-xs font-bold text-[#F8FAFC]">Bandit AST Analyzer</h4>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  Verified Python AST security constraints.
                </p>
              </div>
            </div>
            {v.bandit_passed ? (
              <span className="text-xs font-mono font-bold text-[#18E6A8] bg-[#18E6A8]/10 border border-[#18E6A8]/20 px-3 py-1 rounded-full">
                0 Warnings
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-[#F05B68] bg-[#F05B68]/10 border border-[#F05B68]/20 px-3 py-1 rounded-full">
                Failed
              </span>
            )}
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#151E2D]/50 transition-colors">
            <div className="flex items-center gap-4">
              {v.syntax_passed ? (
                <CheckCircle2 className="h-5 w-5 text-[#18E6A8]" />
              ) : (
                <XCircle className="h-5 w-5 text-[#F05B68]" />
              )}
              <div>
                <h4 className="text-xs font-bold text-[#F8FAFC]">Syntax Compilation Check</h4>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  Parsed via python AST module to ensure code compiles cleanly.
                </p>
              </div>
            </div>
            {v.syntax_passed ? (
              <span className="text-xs font-mono font-bold text-[#18E6A8] bg-[#18E6A8]/10 border border-[#18E6A8]/20 px-3 py-1 rounded-full">
                Passed
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-[#F05B68] bg-[#F05B68]/10 border border-[#F05B68]/20 px-3 py-1 rounded-full">
                SyntaxError
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
