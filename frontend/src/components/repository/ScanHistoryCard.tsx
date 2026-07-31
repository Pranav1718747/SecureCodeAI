import React, { useState, useRef, useEffect } from 'react';
import { Scan } from '../../types/scan';
import {
  ShieldAlert,
  Loader2,
  GitBranch,
  Clock,
  Terminal,
  ShieldCheck,
  Download,
  FileJson,
  Trash2,
  ArrowRight,
  MoreVertical,
  Star,
  Edit3,
  Archive,
  Copy,
  FileText,
  Square,
  CheckSquare,
  Eye,
  ArrowLeftRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanHistoryCardProps {
  scan: Scan;
  isSelected?: boolean;
  onToggleSelect?: (scanId: string) => void;
  onTogglePin?: (scanId: string) => void;
  onRename?: (scan: Scan) => void;
  onArchive?: (scan: Scan) => void;
  onDelete?: (scan: Scan) => void;
  onOpenDetails?: (scan: Scan) => void;
  onExport?: (scan: Scan, format: 'PDF' | 'JSON' | 'SARIF') => void;
  onDuplicate?: (scan: Scan) => void;
  onCompare?: (scan: Scan) => void;
}

export const ScanHistoryCard: React.FC<ScanHistoryCardProps> = ({
  scan,
  isSelected = false,
  onToggleSelect,
  onTogglePin,
  onRename,
  onArchive,
  onDelete,
  onOpenDetails,
  onExport,
  onDuplicate,
  onCompare,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCompleted = scan.status === 'COMPLETED';
  const isFailed = scan.status === 'FAILED';
  const isRunning = scan.status === 'IN_PROGRESS' || scan.status === 'QUEUED';
  const isArchived = scan.status === 'ARCHIVED';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format Duration
  let durationStr = '--';
  if (scan.started_at && scan.completed_at) {
    const s = new Date(scan.started_at).getTime();
    const e = new Date(scan.completed_at).getTime();
    const diffSecs = Math.max(0, Math.floor((e - s) / 1000));
    durationStr = `${Math.floor(diffSecs / 60)}m ${diffSecs % 60}s`;
  }

  const scanTitle = scan.custom_name || `Scan #${scan.id.split('-')[0]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className={`bg-[#111827] border ${
        isSelected
          ? 'border-[#18E6A8] bg-[#18E6A8]/5 shadow-[0_0_0_1px_rgba(24,230,168,0.3)]'
          : scan.is_pinned
          ? 'border-[#FBBF24]/40 bg-[#FBBF24]/5'
          : 'border-white/[0.08] hover:border-[#18E6A8]/30'
      } rounded-2xl overflow-hidden transition-all duration-200 group shadow-[0_4px_20px_rgba(0,0,0,0.25)] relative cursor-pointer`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Checkbox, Pin, Status & Metadata */}
          <div className="flex items-start md:items-center gap-4">
            {/* Checkbox for Selection Mode */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.(scan.id);
              }}
              className="p-1 text-[#94A3B8] hover:text-[#18E6A8] transition-colors mt-1 md:mt-0"
              title="Select Scan"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-[#18E6A8]" />
              ) : (
                <Square className="w-5 h-5 text-[#64748B] group-hover:text-[#94A3B8]" />
              )}
            </button>

            {/* Star Pin Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin?.(scan.id);
              }}
              className="p-1 text-[#94A3B8] hover:text-[#FBBF24] transition-colors mt-1 md:mt-0"
              title={scan.is_pinned ? 'Unpin Scan' : 'Pin Scan to top'}
            >
              <Star
                className={`w-4 h-4 ${
                  scan.is_pinned ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-[#64748B]'
                }`}
              />
            </button>

            {/* Status Icon Container */}
            <div
              onClick={() => onOpenDetails?.(scan)}
              className={`p-3 rounded-xl flex-shrink-0 relative border ${
                isCompleted
                  ? 'bg-[#18E6A8]/10 text-[#18E6A8] border-[#18E6A8]/20'
                  : isRunning
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : isFailed
                  ? 'bg-[#F05B68]/10 text-[#F05B68] border-[#F05B68]/20'
                  : isArchived
                  ? 'bg-[#64748B]/10 text-[#94A3B8] border-[#64748B]/20'
                  : 'bg-[#151E2D] text-[#94A3B8] border-white/[0.08]'
              }`}
            >
              {isRunning && (
                <span className="absolute inset-0 rounded-xl bg-blue-500/20 animate-ping opacity-75" />
              )}
              {isRunning ? (
                <Loader2 className="h-5 w-5 animate-spin relative z-10" />
              ) : isCompleted ? (
                <ShieldCheck className="h-5 w-5 relative z-10" />
              ) : (
                <ShieldAlert className="h-5 w-5 relative z-10" />
              )}
            </div>

            {/* Title & Metadata */}
            <div onClick={() => onOpenDetails?.(scan)} className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h4 className="text-[#F8FAFC] font-bold text-base font-mono flex items-center gap-2 group-hover:text-[#18E6A8] transition-colors truncate">
                  {scanTitle}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[#18E6A8]" />
                </h4>

                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isCompleted
                      ? 'text-[#18E6A8] bg-[#18E6A8]/10 border-[#18E6A8]/20'
                      : isRunning
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse'
                      : isFailed
                      ? 'text-[#F05B68] bg-[#F05B68]/10 border-[#F05B68]/20'
                      : isArchived
                      ? 'text-[#94A3B8] bg-[#64748B]/10 border-[#64748B]/20'
                      : 'text-[#94A3B8] bg-[#151E2D] border-white/[0.08]'
                  }`}
                >
                  {scan.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#94A3B8] font-mono">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-[#64748B]" />
                  {scan.branch_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[#64748B]" />
                  {scan.commit_hash ? scan.commit_hash.substring(0, 7) : 'latest'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                  {new Date(scan.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right Stats & Three Dots Menu */}
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 font-mono">
            <div onClick={() => onOpenDetails?.(scan)} className="flex flex-col items-end">
              <span className="text-[#64748B] text-[10px] uppercase font-semibold mb-0.5">
                Duration
              </span>
              <span className="text-[#F8FAFC] text-sm font-bold">{durationStr}</span>
            </div>

            <div onClick={() => onOpenDetails?.(scan)} className="flex flex-col items-end">
              <span className="text-[#64748B] text-[10px] uppercase font-semibold mb-0.5">
                Findings
              </span>
              <span
                className={`text-xl font-bold ${
                  !isCompleted
                    ? 'text-[#64748B]'
                    : scan.total_vulnerabilities > 0
                    ? 'text-[#F05B68]'
                    : 'text-[#18E6A8]'
                }`}
              >
                {!isCompleted ? '--' : scan.total_vulnerabilities}
              </span>
            </div>

            {/* Three Dots Context Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2D] rounded-xl transition-colors"
                title="Scan Actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-52 bg-[#151E2D] border border-white/[0.08] rounded-2xl shadow-2xl p-1.5 z-30 font-mono text-xs text-[#F8FAFC]"
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenDetails?.(scan);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111827] rounded-xl transition-colors text-left"
                    >
                      <Eye className="w-4 h-4 text-[#18E6A8]" />
                      <span>View Report</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onRename?.(scan);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111827] rounded-xl transition-colors text-left"
                    >
                      <Edit3 className="w-4 h-4 text-[#94A3B8]" />
                      <span>Rename Scan</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onExport?.(scan, 'JSON');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111827] rounded-xl transition-colors text-left"
                    >
                      <FileJson className="w-4 h-4 text-[#94A3B8]" />
                      <span>Export JSON</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onExport?.(scan, 'SARIF');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111827] rounded-xl transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-[#94A3B8]" />
                      <span>Export SARIF</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onCompare?.(scan);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111827] rounded-xl transition-colors text-left"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-[#94A3B8]" />
                      <span>Compare Scans</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDuplicate?.(scan);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111827] rounded-xl transition-colors text-left"
                    >
                      <Copy className="w-4 h-4 text-[#94A3B8]" />
                      <span>Duplicate Scan</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onArchive?.(scan);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111827] rounded-xl transition-colors text-left"
                    >
                      <Archive className="w-4 h-4 text-[#94A3B8]" />
                      <span>{isArchived ? 'Unarchive' : 'Archive Scan'}</span>
                    </button>

                    <div className="h-px bg-white/[0.08] my-1" />

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete?.(scan);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F05B68]/10 text-[#F05B68] rounded-xl transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Scan</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Quick Actions Bar */}
      <div className="absolute top-1/2 -translate-y-1/2 right-14 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <div className="bg-[#151E2D] border border-white/[0.08] rounded-xl shadow-xl p-1 flex items-center gap-1">
          <button
            onClick={() => onExport?.(scan, 'PDF')}
            className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-lg transition-colors"
            title="Download PDF Report"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => onExport?.(scan, 'JSON')}
            className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-lg transition-colors"
            title="Export JSON"
          >
            <FileJson className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDuplicate?.(scan)}
            className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-lg transition-colors"
            title="Duplicate Scan"
          >
            <Copy className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
          <button
            onClick={() => onDelete?.(scan)}
            className="p-2 text-[#F05B68] hover:bg-[#F05B68]/10 rounded-lg transition-colors"
            title="Delete Scan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
