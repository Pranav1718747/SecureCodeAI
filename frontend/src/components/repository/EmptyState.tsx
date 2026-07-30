import { ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  onScan: () => void;
  isScanning: boolean;
}

export const EmptyState = ({ onScan, isScanning }: EmptyStateProps) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <ShieldAlert className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">No Security Scans Found</h3>
        <p className="text-slate-400 mb-8 max-w-md text-sm leading-relaxed">
          This repository hasn't been scanned yet. Run your first deep analysis to discover vulnerabilities, secrets, and architectural flaws.
        </p>
        <button
          onClick={onScan}
          disabled={isScanning}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
        >
          {isScanning ? 'Initializing Scan...' : 'Start Initial Analysis'}
        </button>
      </div>
    </div>
  );
};
