import { motion } from 'framer-motion';
import { CheckCircle2, GitBranch, Code2, Search, BrainCircuit, ShieldCheck, FileCheck2, Flag } from 'lucide-react';

export const CompletedTimeline = () => {
  const stages = [
    { name: 'Repository Cloned', icon: GitBranch },
    { name: 'Code Parsed', icon: Code2 },
    { name: 'Static Analysis', icon: Search },
    { name: 'AI Validation', icon: BrainCircuit },
    { name: 'Patch Generation', icon: ShieldCheck },
    { name: 'Review Ready', icon: Flag },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <FileCheck2 className="h-4 w-4 text-emerald-400" />
        Scan Timeline
      </h3>
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-3 top-2 bottom-4 w-px bg-slate-800" />
        
        <div className="space-y-4">
          {stages.map((stage, i) => (
            <motion.div 
              key={stage.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative flex items-center gap-3 pl-8"
            >
              {/* Node */}
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>
              
              <stage.icon className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-300">{stage.name}</span>
              
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
