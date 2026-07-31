import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  unit?: string;
  decimals?: number;
  icon: LucideIcon;
  trend: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit = '',
  decimals = 0,
  icon: Icon,
  trend,
  trendType = 'positive',
  subtitle = 'vs last 30 days',
}) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const [displayValue, setDisplayValue] = useState<string>('0');

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayValue(latest.toFixed(decimals));
    });
  }, [spring, decimals]);

  const isPositive = trendType === 'positive';
  const isNegative = trendType === 'negative';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 shadow-lg relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
          {displayValue}
        </span>
        {unit && <span className="text-sm font-medium text-emerald-400">{unit}</span>}
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-xs">
        <span
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : isNegative
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : isNegative ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {trend}
        </span>
        <span className="text-slate-500">{subtitle}</span>
      </div>
    </motion.div>
  );
};
