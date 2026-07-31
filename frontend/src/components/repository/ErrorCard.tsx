import React, { useState } from 'react';
import { AlertOctagon, RefreshCw, Copy, ChevronDown } from 'lucide-react';

interface ErrorCardProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ error, onRetry }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#111827] border border-[#F05B68]/30 p-6 rounded-2xl relative overflow-hidden shadow-lg">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#F05B68]" />

      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-[#F05B68]/10 rounded-xl text-[#F05B68]">
          <AlertOctagon className="h-6 w-6" />
        </div>

        <div className="flex-1 font-sans">
          <h3 className="text-base font-bold text-[#F8FAFC] mb-1">Failed to Load Repository</h3>
          <p className="text-xs text-[#94A3B8] mb-4">
            An error occurred while fetching repository telemetry or scan history.
          </p>

          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 bg-[#F05B68]/10 hover:bg-[#F05B68]/20 text-[#F05B68] px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors border border-[#F05B68]/20"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-mono transition-colors"
            >
              <span>View Technical Details</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {expanded && (
            <div className="mt-4 bg-[#151E2D] border border-white/[0.08] rounded-xl p-3.5 relative group">
              <button
                className="absolute top-2 right-2 p-1.5 bg-[#111827] rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(error)}
                title="Copy logs"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <pre className="text-xs text-[#F05B68] font-mono whitespace-pre-wrap overflow-x-auto">
                {error || 'Error details not available'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
