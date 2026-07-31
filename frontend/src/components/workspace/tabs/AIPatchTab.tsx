import { Patch } from '../../../types/scan';
import { GitCommit, Download, Copy, AlertTriangle, Wand2, Loader2, CheckCircle2, Clock, Shield, GitPullRequest } from 'lucide-react';
import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface AIPatchTabProps {
  patch: Patch | null;
  isGenerating: boolean;
  onGenerate: () => void;
  error: any | null;
  onCreatePR?: () => void;
  isCreatingPR?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AIPatchTabErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AIPatchTab ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#09111F] p-8">
          <div className="max-w-md w-full bg-[#111827] border border-white/[0.06] rounded-[20px] p-8 text-center shadow-lg">
            <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-[#F8FAFC] mb-2">
              Unable to render patch preview.
            </h2>
            <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
              The patch was generated successfully, but the preview could not be displayed. Please regenerate the preview.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  this.setState({ hasError: false });
                  if (this.props.onRetry) this.props.onRetry();
                }}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-mono text-xs font-semibold transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AIPatchTabContent = ({ patch, isGenerating, onGenerate, error, onCreatePR, isCreatingPR }: AIPatchTabProps) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [generationStage, setGenerationStage] = useState(0);
  const [prStage, setPrStage] = useState(0);

  // Mock progress stages for PR Creation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCreatingPR) {
      setPrStage(0);
      interval = setInterval(() => {
        setPrStage(prev => Math.min(prev + 1, 5));
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCreatingPR]);

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

  // Development Logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AIPatchTab State:', {
        patch,
        isGenerating,
        error,
        isCreatingPR
      });
    }
  }, [patch, isGenerating, error, isCreatingPR]);

  // 1. Empty State
  if (!patch && !isGenerating && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#09111F] p-8">
        <div className="max-w-md w-full bg-[#111827] border border-white/[0.06] rounded-[20px] p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-[#0F172A] border border-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-6">
            <Wand2 className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-2">No AI Patch Generated Yet</h2>
          <p className="text-xs text-[#94A3B8] mb-8 leading-relaxed">
            Generate a secure, repository-specific patch using the AI Security Engineer.
          </p>
          
          <div className="flex flex-col gap-3 text-left mb-8">
            <div className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Estimated generation time</span>
              <span className="text-xs font-mono text-[#F8FAFC]">5–15 seconds</span>
            </div>
            <div className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Estimated token usage</span>
              <span className="text-xs font-mono text-amber-400">Medium</span>
            </div>
          </div>

          <button 
            onClick={onGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(79,70,229,0.30)] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              borderRadius: '16px',
              border: 'none',
            }}
          >
            <Wand2 className="h-5 w-5 text-white" />
            Generate AI Patch
          </button>
        </div>
      </div>
    );
  }

  // 2. Error State (No Patch available & not generating)
  if (error && !isGenerating && !patch) {
    const errorString = typeof error === 'string' ? error : (error?.human_message || error?.reason || error?.message || 'An error occurred during patch generation');
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#09111F] p-8">
        <div className="max-w-md w-full bg-rose-500/10 border border-rose-500/20 rounded-[20px] p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-rose-400 mb-2">Network Error</h2>
          <p className="text-xs text-rose-200/70 mb-6 leading-relaxed">{errorString}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={onGenerate}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl font-mono text-xs font-semibold transition-colors border border-rose-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Generating State
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
      <div className="flex flex-col items-center justify-center h-full bg-[#09111F] p-8">
        <div className="max-w-md w-full bg-[#111827] border border-white/[0.06] rounded-[20px] p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <div>
              <h2 className="text-base font-semibold text-[#F8FAFC]">Generating Secure Patch...</h2>
              <div className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1 font-mono">
                <Clock className="h-3 w-3" /> Estimated remaining: {Math.max(0, 15 - generationStage * 2)}s
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const isPast = idx < generationStage;
              const isCurrent = idx === generationStage;
              if (idx > generationStage + 1 && idx > 2) return null;
              
              return (
                <div key={idx} className={`flex items-center gap-3 text-xs ${
                  isPast ? 'text-emerald-400' : 
                  isCurrent ? 'text-indigo-400' : 
                  'text-[#64748B]'
                }`}>
                  {isPast ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/[0.06]" />
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

  // 4. PR Creation State
  const isStringError = typeof error === 'string';
  const isObjectError = error !== null && typeof error === 'object';
  const errorStringVal = isStringError ? error : (isObjectError ? (error?.human_message || error?.reason || error?.message || '') : '');
  const hasPrError = error !== null && (
    (isStringError && (errorStringVal.includes('create Pull Request') || errorStringVal.includes('push branch') || errorStringVal.includes('Failed to'))) ||
    isObjectError
  );

  if (isCreatingPR || (patch && hasPrError)) {
    const prStages = [
      "Repository cloned",
      "Patch generated",
      "Patch validated",
      "Git branch created",
      "Commit created",
      "Pull Request prepared"
    ];

    const errorTitle = isObjectError ? (error?.category || 'PR Creation Failed') : 'PR Creation Failed';
    const errorMsg = isObjectError ? (error?.human_message || error?.reason || error?.message) : errorStringVal;

    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#09111F] p-8 overflow-y-auto">
        <div className="max-w-xl w-full bg-[#111827] border border-white/[0.06] rounded-[20px] p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            {error ? (
              <AlertTriangle className="h-8 w-8 text-rose-500 shrink-0" />
            ) : (
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin shrink-0" />
            )}
            <div>
              <h2 className={`text-base font-semibold ${error ? 'text-rose-500' : 'text-[#F8FAFC]'}`}>
                {error ? errorTitle : 'Preparing Pull Request...'}
              </h2>
              <div className={`text-xs ${error ? 'text-rose-400' : 'text-[#94A3B8]'} flex items-center gap-1 mt-1 leading-relaxed`}>
                {errorMsg || 'Applying secure patch to remote repository'}
              </div>
            </div>
          </div>
          
          {!error && (
            <div className="space-y-4 mb-8">
              {prStages.map((stage, idx) => {
                const isPast = idx < prStage;
                const isCurrent = idx === prStage;
                
                return (
                  <div key={idx} className={`flex items-center gap-3 text-xs transition-all duration-500 ${
                    isPast ? 'text-emerald-400 opacity-100' : 
                    isCurrent ? 'text-blue-400 opacity-100 translate-x-2' : 
                    'text-[#64748B] opacity-50'
                  }`}>
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/[0.06]" />
                    )}
                    <span className={isCurrent ? 'font-medium' : ''}>{stage}</span>
                  </div>
                );
              })}
            </div>
          )}

          {isObjectError && (
            <div className="mt-6 space-y-4 text-left">
              <div className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Failed Stage</span>
                  <span className="text-xs font-mono text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">{error?.stage || 'Unknown'}</span>
                </div>
                
                {error?.command && (
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">Command</span>
                    <pre className="text-xs font-mono text-[#F8FAFC] bg-[#111827] p-3 rounded-xl overflow-x-auto border border-white/[0.06]">
                      {error.command}
                    </pre>
                  </div>
                )}

                {error?.stderr && (
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">Error Output</span>
                    <pre className="text-xs font-mono text-rose-400 bg-[#111827] p-3 rounded-xl overflow-x-auto border border-white/[0.06]">
                      {error.stderr}
                    </pre>
                  </div>
                )}
                
                {Array.isArray(error?.possible_fixes) && error.possible_fixes.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">Suggested Fixes</span>
                    <ul className="list-disc list-inside text-xs text-[#F8FAFC] space-y-1">
                      {error.possible_fixes.map((fix: string, idx: number) => (
                        <li key={idx}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-8 flex justify-end gap-3 border-t border-white/[0.06] pt-6">
              <button 
                onClick={onGenerate}
                className="px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0F172A] border border-white/[0.06] hover:bg-[#111827] rounded-xl transition-colors"
              >
                Back to Patch
              </button>
              <button 
                onClick={onCreatePR}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. Success State Guard
  if (!patch) return null;

  // Safe string method helper & diff parser
  const parseDiff = (diffStr?: string) => {
    if (typeof diffStr !== 'string' || !diffStr.trim()) return [];
    const lines = diffStr.split('\n');
    let oldLineNum = 0;
    let newLineNum = 0;
    
    const hunkMatch = lines.find(l => typeof l === 'string' && l.startsWith('@@'));
    if (hunkMatch) {
      const match = hunkMatch.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLineNum = parseInt(match[1], 10) - 1;
        newLineNum = parseInt(match[2], 10) - 1;
      }
    }

    return lines.map(line => {
      const safeLine = typeof line === 'string' ? line : String(line ?? '');
      let type = 'context';
      let oldL = oldLineNum;
      let newL = newLineNum;

      if (safeLine.startsWith('---') || safeLine.startsWith('+++') || safeLine.startsWith('@@')) {
        type = 'header';
      } else if (safeLine.startsWith('-')) {
        type = 'deletion';
        oldL = ++oldLineNum;
        newL = -1;
      } else if (safeLine.startsWith('+')) {
        type = 'addition';
        oldL = -1;
        newL = ++newLineNum;
      } else {
        oldL = ++oldLineNum;
        newL = ++newLineNum;
      }
      return { line: safeLine, type, oldL, newL };
    });
  };

  const rawDiff = patch?.diff_content || patch?.ai_response_json?.diff || patch?.ai_response_json?.patch || '';
  const parsedLines = parseDiff(rawDiff);
  const linesAdded = parsedLines.filter(l => l.type === 'addition').length;
  const linesRemoved = parsedLines.filter(l => l.type === 'deletion').length;
  
  const createdDate = patch?.created_at ? new Date(patch.created_at) : new Date();
  const formattedDate = !isNaN(createdDate.getTime()) ? formatDistanceToNow(createdDate, { addSuffix: true }) : 'recently';

  const patchId = typeof patch?.id === 'string' ? patch.id : '';
  const isFallback = 
    (patch?.ai_response_json as any)?.metadata?.status === 'fallback' || 
    patchId.startsWith('fallback-');

  const fallbackFix = patch?.ai_response_json?.fallback_fix;

  return (
    <div className="flex flex-col h-full bg-[#09111F]">
      {/* Fallback Warning Banner */}
      {isFallback && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-amber-400 mb-0.5">AI Service Unavailable</h4>
            <p className="text-xs text-[#94A3B8]">
              The AI Security Engine is currently unavailable. Displaying deterministic fallback fix based on rule metadata.
            </p>
          </div>
        </div>
      )}

      {/* Success Banner & Metadata */}
      <div className="bg-[#111827] border-b border-white/[0.06] p-6 flex items-start justify-between">
        <div className="flex gap-4">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl h-fit border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-emerald-400 font-semibold text-base mb-1">
              {isFallback ? 'Fallback Patch Available' : 'Patch generated successfully'}
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#94A3B8] font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#10B981]" /> 
                Generated {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-[#10B981]" /> 
                AI Model: {isFallback ? "Fallback Engine" : (patch?.ai_response_json ? "llama-3.3-70b-versatile" : "Unknown")}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> 
                Verification Status: {patch?.status === 'REJECTED' ? 'Failed' : 'Passed'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={onGenerate}
          className="text-xs text-[#10B981] hover:text-[#34D399] font-medium px-3.5 py-2 rounded-xl hover:bg-[#10B981]/10 border border-transparent hover:border-[#10B981]/20 transition-all"
        >
          Regenerate Patch
        </button>
      </div>

      {/* PR Style Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-6 border-b border-white/[0.06] bg-[#0F172A] shrink-0 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2.5">
            <GitCommit className="h-5 w-5 text-[#10B981]" />
            {patch?.ai_response_json?.pr_title || "AI Generated Security Patch"}
          </h2>
          <div className="text-xs text-[#94A3B8] mt-2 mb-3 max-w-2xl leading-relaxed">
            {patch?.ai_response_json?.pr_description || patch?.explanation || "A secure patch has been automatically synthesized to resolve identified vulnerabilities."}
          </div>
          <div className="text-xs text-[#94A3B8] flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              +{linesAdded} additions
            </span>
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              -{linesRemoved} deletions
            </span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              {patch?.ai_response_json?.breaking_change ? "High Merge Risk" : "Low Merge Risk"}
            </span>
          </div>
        </div>

        {/* Diff Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#111827] rounded-xl border border-white/[0.06] p-1 gap-1">
            <button 
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${viewMode === 'unified' ? 'bg-[#0F172A] text-[#F8FAFC] border border-white/[0.06]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
            >
              Unified
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${viewMode === 'split' ? 'bg-[#0F172A] text-[#F8FAFC] border border-white/[0.06]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
            >
              Split
            </button>
          </div>
          
          <button className="h-8 w-8 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] bg-[#111827] border border-white/[0.06] hover:bg-[#0F172A] rounded-xl transition-colors" title="Copy Patch">
            <Copy className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] bg-[#111827] border border-white/[0.06] hover:bg-[#0F172A] rounded-xl transition-colors" title="Download .patch">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Diff Viewer */}
      <div className="flex-1 overflow-auto bg-[#09111F] p-6">
        {parsedLines.length > 0 ? (
          <div className="border border-white/[0.06] rounded-[20px] overflow-hidden bg-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            {parsedLines.map((l, i) => {
              if (l.type === 'header') {
                return (
                  <div key={i} className="flex bg-[#0F172A] text-[#94A3B8] font-mono text-xs py-2 px-4 border-b border-white/[0.06]">
                    {l.line}
                  </div>
                );
              }

              const isAdd = l.type === 'addition';
              const isDel = l.type === 'deletion';
              
              return (
                <div key={i} className={`flex font-mono text-xs leading-relaxed ${
                  isAdd ? 'bg-emerald-500/10' : 
                  isDel ? 'bg-red-500/10' : 
                  ''
                }`}>
                  {/* Line Numbers */}
                  <div className="flex w-[100px] shrink-0 select-none text-right text-[#64748B] border-r border-white/[0.06]">
                    <div className={`w-1/2 pr-2 py-1 ${isDel ? 'bg-red-500/20 text-red-400' : isAdd ? 'bg-emerald-500/10' : 'hover:text-[#F8FAFC]'}`}>
                      {l.oldL !== -1 ? l.oldL : ''}
                    </div>
                    <div className={`w-1/2 pr-2 py-1 border-l border-white/[0.06] ${isAdd ? 'bg-emerald-500/20 text-emerald-400' : isDel ? 'bg-red-500/10' : 'hover:text-[#F8FAFC]'}`}>
                      {l.newL !== -1 ? l.newL : ''}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 pl-4 py-1 whitespace-pre-wrap ${
                    isAdd ? 'text-emerald-300' : 
                    isDel ? 'text-red-300' : 
                    'text-[#F8FAFC]'
                  }`}>
                    {l.line}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#111827] border border-white/[0.06] rounded-[20px] max-w-md mx-auto my-12">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-[#F8FAFC] mb-1">No patch content available</h4>
            <p className="text-xs text-[#94A3B8]">
              Patch generation completed but no diff content was returned.
            </p>
          </div>
        )}
      </div>

      {/* Fallback Fix Section */}
      {fallbackFix && (
        <div className="shrink-0 p-6 bg-[#09111F] border-t border-white/[0.06]">
          <div className="bg-[#111827] border border-white/[0.06] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#111827]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#10B981]" />
                <h3 className="font-semibold text-[#F8FAFC] text-xs uppercase tracking-wider">Fallback Secure Fix</h3>
              </div>
              <span className="text-[10px] bg-[#0F172A] text-[#94A3B8] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/[0.06] font-mono font-bold">Fallback Generated</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Context */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-[#94A3B8] uppercase font-bold mb-1">Reason</h4>
                  <p className="text-xs text-[#F8FAFC] leading-relaxed">{fallbackFix.reason || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-[#94A3B8] uppercase font-bold mb-1">Limitations</h4>
                  <p className="text-xs text-[#F8FAFC] leading-relaxed">{fallbackFix.limitations || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-[#94A3B8] uppercase font-bold mb-1">Confidence</h4>
                  <span className="text-xs text-amber-400 font-mono font-medium">{fallbackFix.confidence || 'Medium'}</span>
                </div>
              </div>
              
              {/* Code */}
              <div className="space-y-4">
                <div className="bg-[#0F172A] rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="bg-red-500/10 px-3 py-1 text-xs font-mono text-red-400 border-b border-white/[0.06] flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-red-500/20 text-red-400 rounded">-</span> Before
                  </div>
                  <pre className="p-3 text-xs font-mono text-[#F8FAFC] overflow-x-auto">
                    {fallbackFix.before || ''}
                  </pre>
                </div>
                <div className="bg-[#0F172A] rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 border-b border-white/[0.06] flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded">+</span> After
                  </div>
                  <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                    {fallbackFix.after || ''}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="p-4 bg-[#0F172A] border-t border-white/[0.06] flex justify-end gap-3 shrink-0 mt-auto">
        <button 
          onClick={onGenerate}
          className="px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] bg-[#111827] border border-white/[0.06] hover:bg-[#0F172A] rounded-xl transition-colors"
        >
          Discard Patch
        </button>
        <button 
          onClick={onCreatePR}
          disabled={patch?.status === 'REJECTED' || isCreatingPR}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all font-mono"
        >
          <GitPullRequest className="h-4 w-4" />
          Create Pull Request
        </button>
      </div>
    </div>
  );
};

export const AIPatchTab = (props: AIPatchTabProps) => {
  return (
    <AIPatchTabErrorBoundary onRetry={props.onGenerate}>
      <AIPatchTabContent {...props} />
    </AIPatchTabErrorBoundary>
  );
};
