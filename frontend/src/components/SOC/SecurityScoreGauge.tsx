import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SeverityCount {
  name: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  value: number;
  color: string;
}

interface SecurityScoreGaugeProps {
  score?: number;
  severityData?: SeverityCount[];
}

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({
  score = 88,
  severityData = [
    { name: 'CRITICAL', value: 12, color: 'text-[#F05B68] bg-[#F05B68]/10 border-[#F05B68]/20' },
    { name: 'HIGH', value: 25, color: 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20' },
    { name: 'MEDIUM', value: 45, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { name: 'LOW', value: 30, color: 'text-[#18E6A8] bg-[#18E6A8]/10 border-[#18E6A8]/20' },
  ],
}) => {
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let riskLevel = 'LOW';
  let riskBadgeColor = 'bg-[#18E6A8]/10 text-[#18E6A8] border-[#18E6A8]/20';
  let gaugeColor = '#18E6A8'; // Mint Green Accent

  if (score < 50) {
    riskLevel = 'CRITICAL';
    riskBadgeColor = 'bg-[#F05B68]/10 text-[#F05B68] border-[#F05B68]/20';
    gaugeColor = '#F05B68';
  } else if (score < 70) {
    riskLevel = 'HIGH';
    riskBadgeColor = 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20';
    gaugeColor = '#FBBF24';
  } else if (score < 85) {
    riskLevel = 'MEDIUM';
    riskBadgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    gaugeColor = '#3B82F6';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="bg-[#111827] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#18E6A8]/30 hover:shadow-[0_0_0_1px_rgba(24,230,168,0.15),0_10px_35px_rgba(24,230,168,0.08)] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2 font-sans">
            <ShieldCheck className="w-5 h-5 text-[#18E6A8]" />
            Overall Security Score
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1 font-sans">SOC Organization Health Posture</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border font-mono ${riskBadgeColor}`}>
          Risk: {riskLevel}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        {/* Radial Gauge */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
            <circle
              stroke="#151E2D"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <motion.circle
              stroke={gaugeColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-3xl font-bold font-mono text-[#F8FAFC] tracking-tight"
            >
              {score}
            </motion.span>
            <span className="text-[10px] text-[#64748B] font-mono font-medium uppercase tracking-wider mt-0.5">
              / 100 SCORE
            </span>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          {severityData.map((item) => (
            <div
              key={item.name}
              className={`p-3 rounded-xl border flex flex-col justify-between ${item.color}`}
            >
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider opacity-80">
                {item.name}
              </span>
              <span className="text-xl font-bold font-mono mt-1">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#94A3B8] font-sans">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#18E6A8]" />
          Multi-Agent Shield Active
        </span>
        <span className="font-mono text-[11px] text-[#64748B]">Updated Real-Time</span>
      </div>
    </motion.div>
  );
};
