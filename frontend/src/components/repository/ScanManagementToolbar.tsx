import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  ArrowDownUp,
  Plus,
  Trash2,
  Archive,
  Download,
  ArrowLeftRight,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';

interface ScanManagementToolbarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedScanIds: string[];
  totalScansCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onNewScan: () => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkExport: (format: 'PDF' | 'JSON' | 'CSV' | 'SARIF') => void;
  onCompare: () => void;
}

export const ScanManagementToolbar: React.FC<ScanManagementToolbarProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  selectedScanIds,
  totalScansCount,
  onSelectAll,
  onClearSelection,
  onNewScan,
  onBulkDelete,
  onBulkArchive,
  onBulkExport,
  onCompare,
}) => {
  const filters = ['All', 'Completed', 'Running', 'Failed', 'Archived'];
  const hasSelection = selectedScanIds.length > 0;
  const isAllSelected = totalScansCount > 0 && selectedScanIds.length === totalScansCount;
  const canCompare = selectedScanIds.length === 2;

  return (
    <div className="bg-[#111827] border border-white/[0.08] p-3.5 rounded-2xl sticky top-0 z-20 backdrop-blur-md shadow-lg transition-all duration-200">
      <AnimatePresence mode="wait">
        {!hasSelection ? (
          /* Standard Toolbar */
          <motion.div
            key="standard-toolbar"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
          >
            {/* Left: Checkbox, Search & Filter Tabs */}
            <div className="flex flex-1 flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Select All Checkbox Button */}
              <button
                onClick={onSelectAll}
                className="flex items-center gap-2 px-3 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] rounded-xl text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
                title="Select All Scans"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#18E6A8]" />
                ) : (
                  <Square className="w-4 h-4 text-[#64748B]" />
                )}
                <span className="hidden sm:inline">Select All</span>
              </button>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scans by ID, branch, or trigger..."
                  className="w-full bg-[#151E2D] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#18E6A8]/50 focus:ring-1 focus:ring-[#18E6A8]/30 transition-all font-mono"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="hidden sm:flex bg-[#151E2D] rounded-xl p-1 border border-white/[0.08] font-mono">
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

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end font-mono">
              <button className="flex items-center gap-2 px-3 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] transition-all text-xs font-semibold">
                <Calendar className="h-4 w-4 text-[#18E6A8]" />
                <span className="hidden xl:inline">Last 30 Days</span>
              </button>

              <button className="flex items-center gap-2 px-3 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] transition-all text-xs font-semibold">
                <ArrowDownUp className="h-4 w-4 text-[#18E6A8]" />
                <span className="hidden xl:inline">Newest First</span>
              </button>

              <button
                onClick={onNewScan}
                className="flex items-center gap-2 bg-[#18E6A8] hover:bg-[#34D399] text-[#070B16] px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-[#18E6A8]/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Scan</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Bulk Action Bar */
          <motion.div
            key="bulk-toolbar"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-4 font-mono text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#18E6A8]/10 border border-[#18E6A8]/20 text-[#18E6A8] font-bold rounded-lg">
                {selectedScanIds.length} Selected
              </span>

              <button
                onClick={onClearSelection}
                className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 hover:bg-[#151E2D] rounded-lg transition-colors"
                title="Cancel Selection"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>

            {/* Bulk Actions Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onCompare}
                disabled={!canCompare}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold border transition-all ${
                  canCompare
                    ? 'bg-[#151E2D] hover:bg-[#1E293B] border-white/[0.08] text-[#18E6A8] hover:border-[#18E6A8]/30 shadow-md'
                    : 'bg-[#151E2D]/50 border-white/[0.04] text-[#64748B] cursor-not-allowed'
                }`}
                title={canCompare ? 'Compare 2 selected scans' : 'Select exactly 2 scans to compare'}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Compare</span>
              </button>

              <button
                onClick={onBulkArchive}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] hover:border-[#18E6A8]/30 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl font-semibold transition-all"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>

              <button
                onClick={() => onBulkExport('JSON')}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#151E2D] hover:bg-[#1E293B] border border-white/[0.08] hover:border-[#18E6A8]/30 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={onBulkDelete}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#F05B68]/10 hover:bg-[#F05B68]/20 border border-[#F05B68]/20 text-[#F05B68] rounded-xl font-semibold transition-all shadow-md shadow-[#F05B68]/10"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
