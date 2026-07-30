import { useState } from 'react';
import { Copy, Check, FileDiff, Download } from 'lucide-react';


interface PatchViewerProps {
  diffContent: string;
}

export const PatchViewer = ({ diffContent }: PatchViewerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(diffContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([diffContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_patch.diff';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse diff string into line objects
  const lines = diffContent.split('\n').filter(line => line.trim() !== ''); // Simple parse
  
  let oldLineNum = 1; // Extremely simplified diff line counter for visual purposes
  let newLineNum = 1;

  // Real diffs have @@ -1,5 +1,5 @@ which we should ideally parse to get exact lines,
  // but for a mocked/visual display, we'll extract starting lines if present.
  const hunkHeaderRegex = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
  const match = diffContent.match(hunkHeaderRegex);
  if (match) {
    oldLineNum = parseInt(match[1], 10);
    newLineNum = parseInt(match[2], 10);
  }

  const parsedLines = lines.map((line) => {
    let type = 'context';
    let oldL = oldLineNum;
    let newL = newLineNum;
    
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
      type = 'header';
      // Don't increment line numbers for headers
      return { line, type, oldL: '', newL: '' };
    } else if (line.startsWith('+')) {
      type = 'add';
      oldL = -1; // Empty
      newLineNum++;
    } else if (line.startsWith('-')) {
      type = 'remove';
      newL = -1; // Empty
      oldLineNum++;
    } else {
      oldLineNum++;
      newLineNum++;
    }

    return { 
      line, 
      type, 
      oldL: oldL === -1 ? '' : oldL, 
      newL: newL === -1 ? '' : newL 
    };
  });

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-sm flex flex-col font-mono text-sm">
      {/* GitHub Style Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <FileDiff className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-300">Suggested Patch</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#21262d] hover:bg-[#30363d] border border-[#363b42] rounded text-slate-300 transition-colors text-xs"
            title="Copy Diff"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#21262d] hover:bg-[#30363d] border border-[#363b42] rounded text-slate-300 transition-colors text-xs"
            title="Download Diff"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      </div>

      {/* Diff Body */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {parsedLines.map((row) => {
              if (row.type === 'header') {
                return (
                  <tr key={`${row.oldL}-${row.newL}-${row.line}`} className="bg-[#1f2428] text-slate-400 text-xs">
                    <td className="px-2 py-1 select-none border-r border-[#30363d] w-10 text-right"></td>
                    <td className="px-2 py-1 select-none border-r border-[#30363d] w-10 text-right"></td>
                    <td className="px-4 py-1 whitespace-pre">{row.line}</td>
                  </tr>
                );
              }
              
              const isAdd = row.type === 'add';
              const isRemove = row.type === 'remove';
              
              const rowClass = isAdd ? 'bg-[#1a3824] text-[#7ee787]' : 
                               isRemove ? 'bg-[#3e1b23] text-[#ffa198]' : 
                               'bg-transparent text-[#e6edf3]';
                               
              const lnClass = isAdd ? 'bg-[#152e1d] border-[#152e1d] text-slate-400' :
                              isRemove ? 'bg-[#31161b] border-[#31161b] text-slate-400' :
                              'bg-transparent border-[#30363d] text-slate-500';

              return (
                <tr key={`${row.oldL}-${row.newL}-${row.line}`} className={rowClass}>
                  <td className={`px-2 py-0.5 select-none border-r w-10 text-right text-xs ${lnClass}`}>
                    {row.oldL}
                  </td>
                  <td className={`px-2 py-0.5 select-none border-r w-10 text-right text-xs ${lnClass}`}>
                    {row.newL}
                  </td>
                  <td className="px-4 py-0.5 whitespace-pre">
                    {/* Add invisible space to empty lines so they render */}
                    {row.line || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
