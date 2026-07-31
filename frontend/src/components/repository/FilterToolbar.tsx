import React, { useState } from 'react';
import { Search, SlidersHorizontal, Calendar, ArrowDownUp } from 'lucide-react';

export const FilterToolbar: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Completed', 'Running', 'Failed'];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111827] border border-white/[0.08] p-3 rounded-2xl sticky top-0 z-20 backdrop-blur-md shadow-md">
      {/* Left: Search & Segmented Filter Pills */}
      <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search scans by ID, branch, or trigger..."
            className="w-full bg-[#151E2D] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#18E6A8]/50 focus:ring-1 focus:ring-[#18E6A8]/30 transition-all font-mono"
          />
        </div>

        <div className="hidden md:flex bg-[#151E2D] rounded-xl p-1 border border-white/[0.08] font-mono">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === f
                  ? 'bg-[#18E6A8] text-[#070B16] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Date, Sort, Advanced Filter Action Buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto font-mono">
        <button className="flex items-center gap-2 px-3 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] transition-all text-xs font-semibold">
          <Calendar className="h-4 w-4 text-[#18E6A8]" />
          <span className="hidden lg:inline">Last 30 Days</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] transition-all text-xs font-semibold">
          <ArrowDownUp className="h-4 w-4 text-[#18E6A8]" />
          <span className="hidden lg:inline">Newest First</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] transition-all text-xs font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-[#18E6A8]" />
          <span className="hidden lg:inline">More Filters</span>
        </button>
      </div>
    </div>
  );
};
