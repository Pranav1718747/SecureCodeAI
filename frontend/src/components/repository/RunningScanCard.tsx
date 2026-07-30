import { Scan } from '../../types/scan';
import { Loader2, ArrowRight, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RunningScanCardProps {
  scan: Scan;
}

export const RunningScanCard = ({ scan }: RunningScanCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
      className="bg-blue-900/10 border border-blue-500/30 rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(59,130,246,0.15)]"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: "45%" }} // Mocked progress
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <Link to={`/review/${scan.id}`} className="block p-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3 rounded-xl flex-shrink-0 bg-blue-500/20 text-blue-400 relative border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="absolute inset-0 rounded-xl bg-blue-400/20 animate-ping opacity-75" />
              <Loader2 className="h-5 w-5 animate-spin relative z-10" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                  Analyzing {scan.branch_name}...
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </h4>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 animate-pulse">
                  IN PROGRESS
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-blue-200/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3" />
                  Static Analysis Stage
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  ~45s remaining
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 ml-14 md:ml-0">
            <div className="flex flex-col items-end">
              <span className="text-blue-300/50 text-[10px] uppercase tracking-wider font-semibold mb-1">Files Processed</span>
              <span className="text-blue-200 font-mono text-sm">142 / 384</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
