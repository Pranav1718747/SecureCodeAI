import { Search, SlidersHorizontal, Calendar, ArrowDownUp } from 'lucide-react';
import { useState } from 'react';

export const FilterToolbar = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Completed', 'Running', 'Failed'];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-2 rounded-xl sticky top-0 z-20 backdrop-blur-md bg-slate-900/90 shadow-sm">
      <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search scans by ID, branch, or trigger..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="hidden md:flex bg-slate-950 rounded-lg p-1 border border-slate-800">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeFilter === f ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors text-sm">
          <Calendar className="h-4 w-4" />
          <span className="hidden lg:inline">Last 30 Days</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors text-sm">
          <ArrowDownUp className="h-4 w-4" />
          <span className="hidden lg:inline">Newest First</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden lg:inline">More Filters</span>
        </button>
      </div>
    </div>
  );
};
