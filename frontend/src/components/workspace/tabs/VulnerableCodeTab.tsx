import { Vulnerability } from '../../../types/scan';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileCode, Download, Copy, Maximize2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VulnerableCodeTabProps {
  vuln: Vulnerability;
}

export const VulnerableCodeTab = ({ vuln }: VulnerableCodeTabProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching code from backend when vuln changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // 600ms simulated network delay
    return () => clearTimeout(timer);
  }, [vuln.id]);

  const line = vuln.line_start || 1;
  const endLine = vuln.line_end || line;
  const startLine = vuln.context_line_start || Math.max(1, line - 10);
  
  const displayCode = vuln.code_context || vuln.snippet || 'No code snippet available.';
  const language = vuln.language || 'python'; // Fallback to python if not specified

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-[#569cd6]" />
          <span className="text-sm text-[#cccccc] font-mono">{vuln.file_path}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-[#cccccc] hover:bg-[#3e3e42] rounded transition-colors" title="Copy code">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-[#cccccc] hover:bg-[#3e3e42] rounded transition-colors" title="Download file">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-[#cccccc] hover:bg-[#3e3e42] rounded transition-colors" title="Fullscreen">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e] relative">
        {isLoading ? (
          <div className="p-4 w-full h-full">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              <span className="text-sm text-slate-400 font-mono">Fetching source code from repository...</span>
            </div>
            {/* Skeleton lines */}
            <div className="space-y-3">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 text-right text-[#858585] text-xs font-mono">{startLine + i}</div>
                  <div 
                    className="h-4 bg-[#2d2d2d] rounded animate-pulse" 
                    style={{ width: `${Math.max(20, Math.random() * 80)}%` }} 
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            showLineNumbers={true}
            startingLineNumber={startLine}
            wrapLines={true}
            customStyle={{
              margin: 0,
              padding: '16px 0',
              background: 'transparent',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            }}
            lineProps={(lineNumber) => {
              let style: React.CSSProperties = { display: 'block' };
              // Highlight the specific vulnerable lines based on vuln metadata
              if (lineNumber >= line && lineNumber <= endLine) {
                style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                style.borderLeft = '3px solid #ef4444';
              }
              return { style };
            }}
          >
            {displayCode}
          </SyntaxHighlighter>
        )}
      </div>
      
      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#007acc] text-white text-xs">
        <div className="flex items-center gap-4">
          <span>Ln {line}, Col 1</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="capitalize">{language}</span>
          <span>Vulnerable</span>
        </div>
      </div>
    </div>
  );
};
