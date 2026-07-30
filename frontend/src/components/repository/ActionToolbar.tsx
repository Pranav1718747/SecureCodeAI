import { Play, Search, Zap, ExternalLink, Settings, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ActionToolbarProps {
  onScan: () => void;
  isScanning: boolean;
}

export const ActionToolbar = ({ onScan, isScanning }: ActionToolbarProps) => {
  const [activeScanType, setActiveScanType] = useState<'quick' | 'deep' | 'custom'>('deep');

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-2 rounded-xl">
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg">
        <button 
          onClick={() => setActiveScanType('quick')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeScanType === 'quick' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <Zap className="h-4 w-4" />
          Quick Scan
        </button>
        <button 
          onClick={() => setActiveScanType('deep')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeScanType === 'deep' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <Search className="h-4 w-4" />
          Deep Scan
        </button>
      </div>

      <div className="flex items-center gap-3 pr-2">
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors" title="Export Data">
          <Download className="h-4 w-4" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors" title="Open in GitHub">
          <ExternalLink className="h-4 w-4" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors" title="Repository Settings">
          <Settings className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-slate-800 mx-1" />
        
        <button 
          onClick={onScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
          Run Scan
        </button>
      </div>
    </div>
  );
};
