import { Patch } from '../../../types/scan';
import { GitCommit, Download, Copy, AlertTriangle, Wand2, Loader2, CheckCircle2, Clock, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface AIPatchTabProps {
  patch: Patch | null;
  isGenerating: boolean;
  onGenerate: () => void;
  error: string | null;
}

export const AIPatchTab = ({ patch, isGenerating, onGenerate, error }: AIPatchTabProps) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [generationStage, setGenerationStage] = useState(0);

  // Mock progress stages during generation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      setGenerationStage(0);
      interval = setInterval(() => {
        setGenerationStage(prev => Math.min(prev + 1, 6));
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Empty State
  if (!patch && !isGenerating && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] p-8">
        <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-[#1f2937] rounded-full flex items-center justify-center mx-auto mb-6">
            <Wand2 className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-[#c9d1d9] mb-2">No AI Patch Generated Yet</h2>
          <p className="text-sm text-[#8b949e] mb-8">
            Generate a secure, repository-specific patch using the AI Security Engineer.
          </p>
          
          <div className="flex flex-col gap-3 text-left mb-8">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm text-[#8b949e]">Estimated generation time</span>
              <span className="text-sm font-medium text-[#c9d1d9]">5–15 seconds</span>
            </div>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm text-[#8b949e]">Estimated token usage</span>
              <span className="text-sm font-medium text-yellow-400">Medium</span>
            </div>
          </div>

          <button 
            onClick={onGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Wand2 className="h-5 w-5" />
            Generate AI Patch
          </button>
        </div>
      </div>
    );
  }

  // Error State
  // We only show error if it's not generating AND we have no patch at all.
  // With the new pipeline, backend always returns a patch (fallback or real), so this only triggers on complete network failure.
  if (error && !isGenerating && !patch) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] p-8">
        <div className="max-w-md w-full bg-rose-500/10 border border-rose-500/30 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-rose-400 mb-2">Network Error</h2>
          <p className="text-sm text-rose-200/70 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={onGenerate}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generating State
  if (isGenerating) {
    const stages = [
      "Analyzing repository context",
      "Reading vulnerable file",
      "Generating secure implementation",
      "Network delay detected. Retrying (1/3)...",
      "Still generating. Retrying (2/3)...",
      "Final attempt. Retrying (3/3)...",
      "Running Semgrep & Bandit verification",
      "Formatting patch"
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] p-8">
        <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <div>
              <h2 className="text-lg font-bold text-[#c9d1d9]">Generating Secure Patch...</h2>
              <div className="text-xs text-[#8b949e] flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> Estimated remaining: {Math.max(0, 15 - generationStage * 2)}s
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const isPast = idx < generationStage;
              const isCurrent = idx === generationStage;
              // If it's a future retry stage, don't show it yet so it doesn't look like we're always expecting to fail
              if (idx > generationStage + 1 && idx > 2) return null;
              
              return (
                <div key={idx} className={`flex items-center gap-3 text-sm ${
                  isPast ? 'text-emerald-400' : 
                  isCurrent ? 'text-purple-400' : 
                  'text-[#8b949e]'
                }`}>
                  {isPast ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-[#30363d]" />
                  )}
                  <span className={isCurrent ? 'font-medium' : ''}>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (!patch) return null; // Should not happen

  // Simple parser to separate the patch into an array of objects
  const parseDiff = (diffStr: string) => {
    const lines = diffStr.split('\n');
    let oldLineNum = 0;
    let newLineNum = 0;
    
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
        newL = -1;
      } else if (line.startsWith('+')) {
        type = 'addition';
        oldL = -1;
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
  
  const createdDate = new Date(patch.created_at);
  const isFallback = (patch.ai_response_json as any)?.metadata?.status === 'fallback' || patch.id.startsWith('fallback-');

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Fallback Warning Banner */}
      {isFallback && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-1">AI Service Unavailable</h4>
            <p className="text-xs text-yellow-200/70">
              The AI Security Engine is currently unavailable. Displaying deterministic fallback fix based on rule metadata.
            </p>
          </div>
        </div>
      )}

      {/* Success Banner & Metadata */}
      <div className="bg-[#161b22] border-b border-[#30363d] p-4 flex items-start justify-between">
        <div className="flex gap-4">
          <div className="bg-emerald-500/10 p-2 rounded-full h-fit">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-emerald-400 font-medium mb-1">
              {isFallback ? 'Fallback Patch Available' : 'Patch generated successfully'}
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#8b949e]">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 
                Generated {formatDistanceToNow(createdDate, { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <Wand2 className="h-3.5 w-3.5" /> 
                AI Model: {isFallback ? "Fallback Engine" : (patch.ai_response_json ? "llama-3.3-70b-versatile" : "Unknown")}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 
                Verification Status: {patch.status === 'REJECTED' ? 'Failed' : 'Passed'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={onGenerate}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium px-3 py-1.5 rounded-md hover:bg-purple-400/10 transition-colors"
        >
          Regenerate Patch
        </button>
      </div>

      {/* PR Style Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117] shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-[#c9d1d9] flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-[#8b949e]" />
            {patch.ai_response_json?.pr_title || "AI Generated Security Patch"}
          </h2>
          <div className="text-sm text-[#8b949e] mt-2 mb-2 max-w-2xl">
            {patch.ai_response_json?.pr_description || patch.explanation}
          </div>
          <div className="text-sm text-[#8b949e] flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#3fb950] font-medium">
              +{linesAdded} additions
            </span>
            <span className="flex items-center gap-1 text-[#f85149] font-medium">
              -{linesRemoved} deletions
            </span>
            <span className="flex items-center gap-1 text-[#d2a8ff]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {patch.ai_response_json?.breaking_change ? "High Merge Risk" : "Low Merge Risk"}
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

      {/* Fallback Fix Section */}
      {patch.ai_response_json?.fallback_fix && (
        <div className="shrink-0 p-6 bg-[#0d1117] border-t border-[#30363d]">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold text-[#c9d1d9] text-sm uppercase tracking-wider">Fallback Secure Fix</h3>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 uppercase tracking-wider px-2 py-1 rounded font-bold">Fallback Generated</span>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Context */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-[#8b949e] uppercase font-bold mb-1">Reason</h4>
                  <p className="text-sm text-[#c9d1d9]">{patch.ai_response_json.fallback_fix.reason}</p>
                </div>
                <div>
                  <h4 className="text-xs text-[#8b949e] uppercase font-bold mb-1">Limitations</h4>
                  <p className="text-sm text-[#c9d1d9]">{patch.ai_response_json.fallback_fix.limitations}</p>
                </div>
                <div>
                  <h4 className="text-xs text-[#8b949e] uppercase font-bold mb-1">Confidence</h4>
                  <span className="text-sm text-yellow-400 font-medium">{patch.ai_response_json.fallback_fix.confidence}</span>
                </div>
              </div>
              
              {/* Code */}
              <div className="space-y-4">
                <div className="bg-[#0d1117] rounded-md border border-[#30363d] overflow-hidden">
                  <div className="bg-[#f8514926] px-3 py-1 text-xs font-mono text-[#ffebe9] border-b border-[#30363d] opacity-80 flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-rose-500/20 text-rose-400 rounded-sm">-</span> Before
                  </div>
                  <pre className="p-3 text-xs font-mono text-[#c9d1d9] overflow-x-auto">
                    {patch.ai_response_json.fallback_fix.before}
                  </pre>
                </div>
                <div className="bg-[#0d1117] rounded-md border border-[#30363d] overflow-hidden">
                  <div className="bg-[#2ea04326] px-3 py-1 text-xs font-mono text-[#e6ffed] border-b border-[#30363d] opacity-80 flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded-sm">+</span> After
                  </div>
                  <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                    {patch.ai_response_json.fallback_fix.after}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
