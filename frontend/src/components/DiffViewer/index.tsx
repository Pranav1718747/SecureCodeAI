import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DiffViewerProps {
  diff: string;
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, className = '' }) => {
  // A simple implementation of a Diff viewer using SyntaxHighlighter with custom line props
  // It color codes lines starting with '+' or '-'

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-800 ${className}`}>
      <SyntaxHighlighter
        language="diff"
        style={vscDarkPlus}
        showLineNumbers={false}
        wrapLines={true}
        lineProps={(lineNumber) => {
          const lines = diff.split('\n');
          const line = lines[lineNumber - 1] || '';
          
          const style: React.CSSProperties = { display: 'block', padding: '0 1rem' };
          
          if (line.startsWith('+') && !line.startsWith('+++')) {
            style.backgroundColor = 'rgba(34, 197, 94, 0.15)'; // green
            style.color = '#4ade80';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; // red
            style.color = '#f87171';
          } else if (line.startsWith('@@')) {
            style.color = '#60a5fa'; // blue for hunk headers
            style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            style.marginTop = '0.5rem';
            style.marginBottom = '0.5rem';
            style.padding = '0.25rem 1rem';
            style.borderRadius = '4px';
          }

          return { style };
        }}
        customStyle={{
          margin: 0,
          padding: '1rem 0',
          background: '#020617', // slate-950
          fontSize: '0.875rem',
        }}
      >
        {diff}
      </SyntaxHighlighter>
    </div>
  );
};
