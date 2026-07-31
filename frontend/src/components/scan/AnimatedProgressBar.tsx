import { motion } from 'framer-motion';

export const AnimatedProgressBar = ({ percentage }: { percentage: number }) => {
  return (
    <div className="w-full h-3.5 bg-[#0F172A] rounded-full overflow-hidden relative border border-[#243244] shadow-inner">
      <motion.div
        className="h-full bg-gradient-to-r from-[#10B981] via-emerald-400 to-[#34D399] rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(1, percentage)}%` }}
        transition={{ type: "spring", bounce: 0, duration: 0.8 }}
      >
        <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden rounded-full">
          <motion.div 
            className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
        
        {/* Glow effect at the tip */}
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent blur-sm rounded-full" />
      </motion.div>
    </div>
  );
};
