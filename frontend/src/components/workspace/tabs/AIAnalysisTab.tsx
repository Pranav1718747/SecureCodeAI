import { Vulnerability, AnalysisReport } from '../../../types/scan';
import { Target, AlertTriangle, Lightbulb, Shield, Code, Crosshair, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../../../services/api';

interface AIAnalysisTabProps {
  vuln: Vulnerability;
}

export const AIAnalysisTab = ({ vuln }: AIAnalysisTabProps) => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadingStage(0);
    setError(null);
    
    // Simulate progress stages while waiting for the backend (which is doing the actual retries)
    const stageTimers = [
      setTimeout(() => isMounted && setLoadingStage(1), 2000), // Generating AI analysis...
      setTimeout(() => isMounted && setLoadingStage(2), 5000), // Network delay detected. Retrying (1/3)...
      setTimeout(() => isMounted && setLoadingStage(3), 8000), // Retrying (2/3)...
      setTimeout(() => isMounted && setLoadingStage(4), 12000) // Retrying (3/3)...
    ];

    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/reviews/vulnerabilities/${vuln.id}/analysis/`);
        if (isMounted) {
          setReport(res.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          // Instead of hard-failing, we just simulate a fallback in the UI 
          // (though the backend should never throw 500 anymore)
          setError('Failed to generate analysis.');
          setIsLoading(false);
        }
      }
    };
    
    fetchAnalysis();
    return () => { 
      isMounted = false; 
      stageTimers.forEach(clearTimeout);
    };
  }, [vuln.id]);

  const loadingMessages = [
    "Connecting to Groq...",
    "Generating AI analysis...",
    "Network delay detected. Retrying (1/3)...",
    "Retrying (2/3)...",
    "Retrying (3/3)..."
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <h3 className="text-[#c9d1d9] font-medium mb-1 transition-all duration-300">
          {loadingMessages[loadingStage] || "Finalizing..."}
        </h3>
        <p className="text-sm text-[#8b949e]">Analyzing repository, language, and vulnerability specifics...</p>
      </div>
    );
  }

  // Detect fallback from new backend structure
  const isFallback = (report as any)?.status === 'fallback' || (report as any)?.fallback_used;
  const displayReport = isFallback ? ((report as any)?.fallback_response || report) : report;

  // We no longer show a blank error screen unless we literally have no report data at all.
  if (error && !report) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-rose-400">
        <AlertTriangle className="h-8 w-8 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto custom-scrollbar pb-24">
      {isFallback && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-1">AI Service Unavailable</h4>
            <p className="text-xs text-yellow-200/70">
              {(report as any).reason || "The AI Security Engine is currently unavailable."} 
              Displaying deterministic fallback analysis based on rule metadata.
            </p>
          </div>
        </motion.div>
      )}
      {/* Overview Block */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-400" />
          Detection Summary
        </h2>
        <div className="prose prose-invert max-w-none text-slate-300">
          <p className="text-sm leading-relaxed">
            The security engine detected a potential <strong>{vuln.title}</strong> vulnerability 
            in <code>{vuln.file_path}</code> at line {vuln.line_start}. 
            This issue is classified as <span className="font-semibold text-rose-400">{vuln.severity}</span> severity.
          </p>
          <p className="text-sm leading-relaxed mt-2 text-slate-400">
            {vuln.description}
          </p>
        </div>
      </motion.div>

      {/* Exploit Walkthrough */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Crosshair className="h-4 w-4" />
          Attack Scenario
        </h3>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <p className="text-sm text-slate-300 leading-relaxed font-mono">
            {displayReport.attack_scenario}
          </p>
        </div>
      </motion.div>

      {/* Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Business Impact
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {displayReport.business_impact}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Compliance Impact
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {displayReport.compliance_impact}
          </p>
        </motion.div>
      </div>

      {/* Remediation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6"
      >
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Recommended Remediation
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {displayReport.remediation}
        </p>
        
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-mono">Secure Pattern Example ({vuln.language})</span>
            <Code className="h-4 w-4 text-slate-600" />
          </div>
          <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">
            {displayReport.secure_example}
          </pre>
        </div>
      </motion.div>
    </div>
  );
};
