import { AlertOctagon, RefreshCw, Copy, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ErrorCardProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorCard = ({ error, onRetry }: ErrorCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
      
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <AlertOctagon className="h-6 w-6 text-red-500" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400 mb-1">Failed to load repository</h3>
          <p className="text-sm text-red-300/70 mb-4">
            We encountered an unexpected error while fetching the repository metadata or scan history.
          </p>
          
          <div className="flex items-center gap-3">
            {onRetry && (
              <button 
                onClick={onRetry}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-1.5 rounded-md text-sm font-medium transition-colors border border-red-500/20"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-red-400/70 hover:text-red-400 text-sm font-medium transition-colors"
            >
              View Technical Details
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {expanded && (
            <div className="mt-4 bg-red-950/50 border border-red-900/50 rounded-lg p-3 relative group">
              <button 
                className="absolute top-2 right-2 p-1.5 bg-red-900/50 rounded text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(error)}
                title="Copy logs"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <pre className="text-xs text-red-300/80 font-mono whitespace-pre-wrap overflow-x-auto">
                {error || "Error details not available"}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
