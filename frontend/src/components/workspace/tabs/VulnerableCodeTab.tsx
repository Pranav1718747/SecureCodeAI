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
    }, 400);
    return () => clearTimeout(timer);
  }, [vuln.id]);

  const line = vuln.line_start || 1;
  const endLine = vuln.line_end || line;
  const startLine = vuln.context_line_start || Math.max(1, line - 10);

  const displayCode = vuln.code_context || vuln.snippet || 'No code snippet available.';
  const language = vuln.language || 'python';

  return (
    <div className="flex flex-col h-full bg-[#070B16] rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] font-mono">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#151E2D] border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <FileCode className="h-4 w-4 text-[#18E6A8]" />
          <span className="text-xs text-[#F8FAFC] font-mono font-semibold">{vuln.file_path}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-xl border border-white/[0.08] transition-colors" title="Copy code">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-xl border border-white/[0.08] transition-colors" title="Download file">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] rounded-xl border border-white/[0.08] transition-colors" title="Fullscreen">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto bg-[#070B16] relative custom-scrollbar">
        {isLoading ? (
          <div className="p-6 w-full h-full">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="h-5 w-5 text-[#18E6A8] animate-spin" />
              <span className="text-xs text-[#94A3B8] font-mono">Fetching source code from repository...</span>
            </div>
            {/* Skeleton lines */}
            <div className="space-y-3">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 text-right text-[#64748B] text-xs font-mono">{startLine + i}</div>
                  <div
                    className="h-4 bg-[#151E2D] rounded-lg animate-pulse"
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
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: "'RM Mono', 'JetBrains Mono', Consolas, monospace",
            }}
            lineProps={(lineNumber) => {
              let style: React.CSSProperties = { display: 'block' };
              if (lineNumber >= line && lineNumber <= endLine) {
                style.backgroundColor = 'rgba(240, 91, 104, 0.18)';
                style.borderLeft = '3px solid #F05B68';
              }
              return { style };
            }}
          >
            {displayCode}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-5 py-2 bg-[#151E2D] border-t border-white/[0.08] text-[#94A3B8] text-xs font-mono">
        <div className="flex items-center gap-4">
          <span>Ln {line}, Col 1</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="capitalize">{language}</span>
          <span className="text-[#F05B68] font-bold">Vulnerable Line</span>
        </div>
      </div>
    </div>
  );
};
