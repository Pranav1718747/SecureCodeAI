import { Vulnerability } from '../../types/scan';
import { Target, Activity, Zap, Shield, FileCheck2, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

interface InsightPanelProps {
  vuln: Vulnerability;
}

export const InsightPanel = ({ vuln }: InsightPanelProps) => {
  // Infer some insights for demonstration since backend doesn't provide all fields yet
  const riskScoreMap = { CRITICAL: 95, HIGH: 80, MEDIUM: 50, LOW: 20 };
  const riskScore = riskScoreMap[vuln.severity as keyof typeof riskScoreMap] || 50;
  
  const fixTimeMap = { CRITICAL: '4 hours', HIGH: '2 hours', MEDIUM: '1 hour', LOW: '15 mins' };
  const fixTime = fixTimeMap[vuln.severity as keyof typeof fixTimeMap] || '1 hour';
  
  const isComplianceImpact = vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH' || vuln.cwe_id.includes('798') || vuln.cwe_id.includes('89');

  const insights = [
    {
      title: 'Risk Score',
      value: `${riskScore}/100`,
      icon: Activity,
      color: riskScore > 80 ? 'text-rose-400' : riskScore > 50 ? 'text-yellow-400' : 'text-blue-400',
    },
    {
      title: 'Attack Surface',
      value: 'Internal & External', // Mocked
      icon: Target,
      color: 'text-slate-300',
    },
    {
      title: 'Est. Fix Time',
      value: fixTime,
      icon: Zap,
      color: 'text-emerald-400',
    },
    {
      title: 'Compliance Impact',
      value: isComplianceImpact ? 'High (PCI-DSS, SOC2)' : 'Low',
      icon: FileCheck2,
      color: isComplianceImpact ? 'text-rose-400' : 'text-slate-400',
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-blue-400" />
          Vulnerability Insights
        </h3>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <motion.div 
            key={insight.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col gap-1 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50"
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5">
              <insight.icon className="h-3 w-3" />
              {insight.title}
            </span>
            <span className={`text-sm font-medium ${insight.color}`}>
              {insight.value}
            </span>
          </motion.div>
        ))}
      </div>
      
      <div className="px-4 pb-4">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Standards Mapping</div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-slate-400" />
            CWE-{vuln.cwe_id}
          </span>
          {vuln.owasp_category && (
            <span className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-slate-400" />
              OWASP Top 10
            </span>
          )}
          <span className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-slate-400" />
            NIST SSDF
          </span>
        </div>
      </div>
    </div>
  );
};
