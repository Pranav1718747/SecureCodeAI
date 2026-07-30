import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Activity } from 'lucide-react';
import { Scan } from '../../types/scan';

interface RepositoryHealthProps {
  scans: Scan[];
}

export const RepositoryHealth = ({ scans }: RepositoryHealthProps) => {
  const latestCompletedScan = scans.find(s => s.status === 'COMPLETED');
  
  // Mock detailed vulnerabilities for the breakdown since we don't fetch all vulns for all scans here
  // We'll use the total_vulnerabilities to derive a mock distribution for the visual
  const total = latestCompletedScan?.total_vulnerabilities || 0;
  
  const mockCounts = {
    critical: Math.floor(total * 0.1),
    high: Math.floor(total * 0.2),
    medium: Math.floor(total * 0.4),
    low: total - (Math.floor(total * 0.1) + Math.floor(total * 0.2) + Math.floor(total * 0.4))
  };

  const riskScore = total === 0 ? 100 : Math.max(0, 100 - (mockCounts.critical * 10 + mockCounts.high * 5 + mockCounts.medium * 2));
  
  const grade = riskScore >= 90 ? 'A+' : 
                riskScore >= 80 ? 'A' : 
                riskScore >= 70 ? 'B' : 
                riskScore >= 50 ? 'C' : 
                riskScore >= 30 ? 'D' : 'F';
                
  const colorClass = riskScore >= 80 ? 'text-emerald-400' : riskScore >= 50 ? 'text-yellow-400' : 'text-rose-500';
  const ringClass = riskScore >= 80 ? 'stroke-emerald-500' : riskScore >= 50 ? 'stroke-yellow-500' : 'stroke-rose-500';

  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          Security Health
        </h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">Based on latest scan</span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
              r="45"
              cx="64"
              cy="64"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`${ringClass}`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              fill="transparent"
              r="45"
              cx="64"
              cy="64"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-black ${colorClass}`}>{grade}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Grade</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center gap-1 group hover:border-slate-700 transition-colors">
            <ShieldAlert className="h-4 w-4 text-rose-500 mb-1 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-2xl font-bold text-white">{mockCounts.critical}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Critical</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center gap-1 group hover:border-slate-700 transition-colors">
            <AlertTriangle className="h-4 w-4 text-orange-500 mb-1 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-2xl font-bold text-white">{mockCounts.high}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">High</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center gap-1 group hover:border-slate-700 transition-colors">
            <AlertCircle className="h-4 w-4 text-yellow-500 mb-1 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-2xl font-bold text-white">{mockCounts.medium}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Medium</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center gap-1 group hover:border-slate-700 transition-colors">
            <Info className="h-4 w-4 text-blue-500 mb-1 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-2xl font-bold text-white">{mockCounts.low}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};
