import { Vulnerability } from '../../../types/scan';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileCode, Download, Copy, Maximize2 } from 'lucide-react';

interface VulnerableCodeTabProps {
  vuln: Vulnerability;
}

export const VulnerableCodeTab = ({ vuln }: VulnerableCodeTabProps) => {
  // We'll mock a snippet around the line number since we don't have full source code in the vuln object currently
  // In a real scenario, this would fetch the full file content from the backend
  
  const line = vuln.line_start || 1;
  const startLine = Math.max(1, line - 10);
  
  const mockCode = `import os
import sys
from utils import get_db_connection

def process_user_input(request):
    user_id = request.GET.get('id')
    
    # Intentionally vulnerable to SQL Injection
    query = f"SELECT * FROM users WHERE id = {user_id}"
    
    db = get_db_connection()
    result = db.execute(query)
    
    return result

def main():
    print("Initializing...")
`;

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
        <SyntaxHighlighter
          language="python" // Mocked, should derive from file extension
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
            // Highlight the specific vulnerable line (we'll highlight the 'query = ...' line in our mock)
            if (lineNumber === startLine + 8) {
              style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              style.borderLeft = '3px solid #ef4444';
            }
            return { style };
          }}
        >
          {mockCode}
        </SyntaxHighlighter>
      </div>
      
      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#007acc] text-white text-xs">
        <div className="flex items-center gap-4">
          <span>Ln {line}, Col 14</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Python</span>
          <span>Vulnerable</span>
        </div>
      </div>
    </div>
  );
};
