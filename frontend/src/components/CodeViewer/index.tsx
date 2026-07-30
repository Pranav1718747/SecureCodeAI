import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'typescript',
  showLineNumbers = true,
  highlightLines = [],
  className = '',
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    // Optionally add a toast here
  };

  return (
    <div className={`relative group rounded-xl overflow-hidden border border-slate-800 ${className}`}>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-md text-slate-300 transition-colors backdrop-blur-sm"
          title="Copy code"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        lineProps={(lineNumber) => {
          const style: React.CSSProperties = { display: 'block' };
          if (highlightLines.includes(lineNumber)) {
            style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; // Red tint for vulnerabilities
            style.borderLeft = '2px solid rgb(239, 68, 68)';
          }
          return { style };
        }}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: '#020617', // slate-950
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
