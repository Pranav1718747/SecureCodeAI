import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileCode2, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CodeViewerProps {
  code: string;
  language: string;
  filePath: string;
  highlightLine?: number; // 1-indexed relative to the snippet start, or actual start if we provide startingLineNumber
  startingLineNumber?: number;
}

export const CodeViewer = ({ code, language, filePath, highlightLine, startingLineNumber = 1 }: CodeViewerProps) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe split for getting extension
  let ext = 'text';
  try {
    const parts = filePath.split('.');
    if (parts.length > 1) ext = parts[parts.length - 1].toLowerCase();
  } catch (e) {}

  // Map extensions to Prism languages if needed
  const langMap: Record<string, string> = {
    js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
    py: 'python', rb: 'ruby', java: 'java', go: 'go',
    rs: 'rust', c: 'c', cpp: 'cpp', cs: 'csharp',
    html: 'html', css: 'css', json: 'json', sh: 'bash', yml: 'yaml', yaml: 'yaml'
  };
  
  const prismLang = langMap[ext] || language || 'javascript';

  const isLong = code.split('\n').length > 15;

  return (
    <div className="bg-[#1e1e1e] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* VS Code Style Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-300">{filePath}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
          {isLong && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-slate-200 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Code Body */}
      <motion.div 
        initial={false}
        animate={{ height: expanded || !isLong ? 'auto' : '300px' }}
        className="relative overflow-hidden"
      >
        <SyntaxHighlighter
          language={prismLang}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '16px 0', background: 'transparent', fontSize: '13px' }}
          showLineNumbers={true}
          startingLineNumber={startingLineNumber}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const isHighlighted = highlightLine === lineNumber;
            return {
              style: {
                display: 'block',
                backgroundColor: isHighlighted ? 'rgba(239, 68, 68, 0.15)' : 'transparent', // rose-500 with low opacity
                borderLeft: isHighlighted ? '3px solid #ef4444' : '3px solid transparent',
              }
            };
          }}
        >
          {code}
        </SyntaxHighlighter>
        
        {/* Fade out gradient when collapsed */}
        {!expanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1e1e1e] to-transparent pointer-events-none" />
        )}
      </motion.div>
      
      {!expanded && isLong && (
        <button 
          onClick={() => setExpanded(true)}
          className="w-full py-2 bg-[#252526] hover:bg-[#2d2d2d] text-xs font-medium text-slate-400 transition-colors border-t border-[#3c3c3c]"
        >
          Show More
        </button>
      )}
    </div>
  );
};
