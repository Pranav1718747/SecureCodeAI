import { Patch } from '../../../types/scan';
import { GitCommit, Download, Copy, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface AIPatchTabProps {
  patch: Patch;
}

export const AIPatchTab = ({ patch }: AIPatchTabProps) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  // Simple parser to separate the patch into an array of objects
  const parseDiff = (diffStr: string) => {
    const lines = diffStr.split('\n');
    let oldLineNum = 0;
    let newLineNum = 0;
    
    // Find the starting line number
    const hunkMatch = lines.find(l => l.startsWith('@@'));
    if (hunkMatch) {
      const match = hunkMatch.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLineNum = parseInt(match[1], 10) - 1;
        newLineNum = parseInt(match[2], 10) - 1;
      }
    }

    return lines.map(line => {
      let type = 'context';
      let oldL = oldLineNum;
      let newL = newLineNum;

      if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
        type = 'header';
      } else if (line.startsWith('-')) {
        type = 'deletion';
        oldL = ++oldLineNum;
        newL = -1; // Not present in new file
      } else if (line.startsWith('+')) {
        type = 'addition';
        oldL = -1; // Not present in old file
        newL = ++newLineNum;
      } else {
        oldL = ++oldLineNum;
        newL = ++newLineNum;
      }

      return { line, type, oldL, newL };
    });
  };

  const parsedLines = parseDiff(patch.diff_content);

  const linesAdded = parsedLines.filter(l => l.type === 'addition').length;
  const linesRemoved = parsedLines.filter(l => l.type === 'deletion').length;

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* PR Style Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
        <div>
          <h2 className="text-lg font-semibold text-[#c9d1d9] flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-[#8b949e]" />
            AI Generated Security Patch
          </h2>
          <div className="text-sm text-[#8b949e] mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#3fb950] font-medium">
              +{linesAdded} additions
            </span>
            <span className="flex items-center gap-1 text-[#f85149] font-medium">
              -{linesRemoved} deletions
            </span>
            <span className="flex items-center gap-1 text-[#d2a8ff]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Low Merge Risk
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#21262d] rounded-md border border-[#30363d] p-0.5">
            <button 
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${viewMode === 'unified' ? 'bg-[#30363d] text-[#c9d1d9]' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
            >
              Unified
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${viewMode === 'split' ? 'bg-[#30363d] text-[#c9d1d9]' : 'text-[#8b949e] hover:text-[#c9d1d9]'}`}
            >
              Split
            </button>
          </div>
          
          <button className="p-2 text-[#8b949e] hover:text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors" title="Copy Patch">
            <Copy className="h-4 w-4" />
          </button>
          <button className="p-2 text-[#8b949e] hover:text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors" title="Download .patch">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Diff Viewer */}
      <div className="flex-1 overflow-auto bg-[#0d1117] p-4">
        <div className="border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
          {parsedLines.map((l, i) => {
            if (l.type === 'header') {
              return (
                <div key={i} className="flex bg-[#f0f6fc1a] text-[#8b949e] font-mono text-xs py-1 px-4 border-b border-[#30363d]">
                  {l.line}
                </div>
              );
            }

            const isAdd = l.type === 'addition';
            const isDel = l.type === 'deletion';
            
            return (
              <div key={i} className={`flex font-mono text-xs leading-[20px] ${
                isAdd ? 'bg-[#2ea04326]' : 
                isDel ? 'bg-[#f8514926]' : 
                ''
              }`}>
                {/* Line Numbers */}
                <div className="flex w-[100px] shrink-0 select-none text-right text-[#8b949e] border-r border-[#30363d]">
                  <div className={`w-1/2 pr-2 py-0.5 ${isDel ? 'bg-[#f851494d] text-[#c9d1d9]' : isAdd ? 'bg-[#2ea04326]' : 'hover:text-[#c9d1d9]'}`}>
                    {l.oldL !== -1 ? l.oldL : ''}
                  </div>
                  <div className={`w-1/2 pr-2 py-0.5 border-l border-[#30363d] ${isAdd ? 'bg-[#2ea0434d] text-[#c9d1d9]' : isDel ? 'bg-[#f8514926]' : 'hover:text-[#c9d1d9]'}`}>
                    {l.newL !== -1 ? l.newL : ''}
                  </div>
                </div>
                
                {/* Content */}
                <div className={`flex-1 pl-4 py-0.5 whitespace-pre-wrap ${
                  isAdd ? 'text-[#e6ffed]' : 
                  isDel ? 'text-[#ffebe9]' : 
                  'text-[#c9d1d9]'
                }`}>
                  {l.line}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
