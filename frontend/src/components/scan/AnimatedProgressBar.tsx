import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <div className="w-full h-3.5 bg-[#151E2D] rounded-full overflow-hidden relative border border-white/[0.08] shadow-inner">
      <motion.div
        className="h-full bg-gradient-to-r from-[#18E6A8] via-[#34D399] to-[#18E6A8] rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(1, percentage)}%` }}
        transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <motion.div
            className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>

        {/* Glowing tip accent */}
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent blur-sm rounded-full" />
      </motion.div>
    </div>
  );
};
