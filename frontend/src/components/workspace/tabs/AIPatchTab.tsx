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
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AIPatchTab ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#070B16] p-8 font-sans">
          <div className="max-w-md w-full bg-[#111827] border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
            <AlertTriangle className="h-12 w-12 text-[#FBBF24] mx-auto mb-4" />
            <h2 className="text-base font-bold text-[#F8FAFC] mb-2">
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
                className="px-5 py-2.5 bg-[#18E6A8]/10 hover:bg-[#18E6A8]/20 text-[#18E6A8] border border-[#18E6A8]/20 rounded-xl font-mono text-xs font-bold transition-all"
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

const AIPatchTabContent = ({
  patch,
  isGenerating,
  onGenerate,
  error,
  onCreatePR,
  isCreatingPR,
}: AIPatchTabProps) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [generationStage, setGenerationStage] = useState(0);
  const [prStage, setPrStage] = useState(0);

  // Mock progress stages for PR Creation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCreatingPR) {
      setPrStage(0);
      interval = setInterval(() => {
        setPrStage((prev) => Math.min(prev + 1, 5));
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
        setGenerationStage((prev) => Math.min(prev + 1, 6));
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // 1. Empty State
  if (!patch && !isGenerating && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#070B16] p-8 font-sans">
        <div className="max-w-md w-full bg-[#111827] border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
          <div className="w-16 h-16 bg-[#151E2D] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wand2 className="h-8 w-8 text-[#18E6A8]" />
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC] mb-2">No AI Patch Generated Yet</h2>
          <p className="text-xs text-[#94A3B8] mb-8 leading-relaxed">
            Generate a secure, repository-specific patch using the AI Security Engineer.
          </p>

          <div className="flex flex-col gap-3 text-left mb-8 font-mono">
            <div className="bg-[#151E2D] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Est. generation time</span>
              <span className="text-xs font-bold text-[#F8FAFC]">5–15 seconds</span>
            </div>
            <div className="bg-[#151E2D] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Est. token usage</span>
              <span className="text-xs font-bold text-[#FBBF24]">Medium</span>
            </div>
          </div>

          <button
            onClick={onGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 text-[#070B16] bg-[#18E6A8] hover:bg-[#34D399] rounded-xl font-bold font-mono text-xs shadow-lg shadow-[#18E6A8]/20 transition-all active:scale-[0.98]"
          >
            <Wand2 className="h-4 w-4 text-[#070B16]" />
            Generate AI Patch
          </button>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !isGenerating && !patch) {
    const errorString =
      typeof error === 'string'
        ? error
        : error?.human_message || error?.reason || error?.message || 'An error occurred during patch generation';
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#070B16] p-8 font-sans">
        <div className="max-w-md w-full bg-[#F05B68]/10 border border-[#F05B68]/20 rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
          <AlertTriangle className="h-12 w-12 text-[#F05B68] mx-auto mb-4" />
          <h2 className="text-base font-bold text-[#F05B68] mb-2">Network Error</h2>
          <p className="text-xs text-[#F05B68]/80 mb-6 leading-relaxed">{errorString}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onGenerate}
              className="px-5 py-2.5 bg-[#F05B68]/20 hover:bg-[#F05B68]/30 text-[#F05B68] rounded-xl font-mono text-xs font-bold transition-colors border border-[#F05B68]/30"
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
      'Analyzing repository context',
      'Reading vulnerable file',
      'Generating secure implementation',
      'Running AST & Semgrep verification',
      'Formatting patch diff',
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#070B16] p-8 font-sans">
        <div className="max-w-md w-full bg-[#111827] border border-white/[0.08] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
          <div className="flex items-center gap-4 mb-8">
            <Loader2 className="h-8 w-8 text-[#18E6A8] animate-spin" />
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC]">Generating Secure Patch...</h2>
              <div className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1 font-mono">
                <Clock className="h-3 w-3 text-[#18E6A8]" /> Est. remaining: {Math.max(0, 15 - generationStage * 2)}s
              </div>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {stages.map((stage, idx) => {
              const isPast = idx < generationStage;
              const isCurrent = idx === generationStage;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 ${
                    isPast
                      ? 'text-[#18E6A8]'
                      : isCurrent
                      ? 'text-[#F8FAFC] font-bold'
                      : 'text-[#64748B]'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-4 w-4 text-[#18E6A8]" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#18E6A8]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/[0.08]" />
                  )}
                  <span>{stage}</span>
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
  const errorStringVal = isStringError
    ? error
    : isObjectError
    ? error?.human_message || error?.reason || error?.message || ''
    : '';
  const hasPrError =
    error !== null &&
    ((isStringError &&
      (errorStringVal.includes('create Pull Request') ||
        errorStringVal.includes('push branch') ||
        errorStringVal.includes('Failed to'))) ||
      isObjectError);

  if (isCreatingPR || (patch && hasPrError)) {
    const prStages = [
      'Repository cloned',
      'Patch generated',
      'Patch validated',
      'Git branch created',
      'Commit created',
      'Pull Request prepared',
    ];

    const errorTitle = isObjectError ? error?.category || 'PR Creation Failed' : 'PR Creation Failed';
    const errorMsg = isObjectError
      ? error?.human_message || error?.reason || error?.message
      : errorStringVal;

    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#070B16] p-8 overflow-y-auto font-sans">
        <div className="max-w-xl w-full bg-[#111827] border border-white/[0.08] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
          <div className="flex items-center gap-4 mb-8">
            {error ? (
              <AlertTriangle className="h-8 w-8 text-[#F05B68] shrink-0" />
            ) : (
              <Loader2 className="h-8 w-8 text-[#18E6A8] animate-spin shrink-0" />
            )}
            <div>
              <h2 className={`text-base font-bold ${error ? 'text-[#F05B68]' : 'text-[#F8FAFC]'}`}>
                {error ? errorTitle : 'Preparing Pull Request...'}
              </h2>
              <div
                className={`text-xs ${
                  error ? 'text-[#F05B68]' : 'text-[#94A3B8]'
                } flex items-center gap-1 mt-1 leading-relaxed font-mono`}
              >
                {errorMsg || 'Applying secure patch to remote repository'}
              </div>
            </div>
          </div>

          {!error && (
            <div className="space-y-4 mb-8 font-mono text-xs">
              {prStages.map((stage, idx) => {
                const isPast = idx < prStage;
                const isCurrent = idx === prStage;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      isPast
                        ? 'text-[#18E6A8]'
                        : isCurrent
                        ? 'text-[#F8FAFC] font-bold translate-x-2'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-[#18E6A8]" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#18E6A8]" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/[0.08]" />
                    )}
                    <span>{stage}</span>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mt-8 flex justify-end gap-3 border-t border-white/[0.08] pt-6 font-mono text-xs">
              <button
                onClick={onGenerate}
                className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] bg-[#151E2D] border border-white/[0.08] hover:bg-[#111827] rounded-xl transition-colors"
              >
                Back to Patch
              </button>
              <button
                onClick={onCreatePR}
                className="px-4 py-2 text-xs font-bold text-[#070B16] bg-[#18E6A8] hover:bg-[#34D399] rounded-xl transition-colors"
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

    const hunkMatch = lines.find((l) => typeof l === 'string' && l.startsWith('@@'));
    if (hunkMatch) {
      const match = hunkMatch.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLineNum = parseInt(match[1], 10) - 1;
        newLineNum = parseInt(match[2], 10) - 1;
      }
    }

    return lines.map((line) => {
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

  const rawDiff =
    patch?.diff_content || patch?.ai_response_json?.diff || patch?.ai_response_json?.patch || '';
  const parsedLines = parseDiff(rawDiff);
  const linesAdded = parsedLines.filter((l) => l.type === 'addition').length;
  const linesRemoved = parsedLines.filter((l) => l.type === 'deletion').length;

  const createdDate = patch?.created_at ? new Date(patch.created_at) : new Date();
  const formattedDate = !isNaN(createdDate.getTime())
    ? formatDistanceToNow(createdDate, { addSuffix: true })
    : 'recently';

  const patchId = typeof patch?.id === 'string' ? patch.id : '';
  const isFallback =
    (patch?.ai_response_json as any)?.metadata?.status === 'fallback' || patchId.startsWith('fallback-');

  const fallbackFix = patch?.ai_response_json?.fallback_fix;

  return (
    <div className="flex flex-col h-full bg-[#070B16] font-sans">
      {/* Fallback Warning Banner */}
      {isFallback && (
        <div className="bg-[#FBBF24]/10 border-b border-[#FBBF24]/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#FBBF24] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#FBBF24] mb-0.5">AI Service Unavailable</h4>
            <p className="text-xs text-[#94A3B8]">
              The AI Security Engine is currently unavailable. Displaying deterministic fallback fix based on rule metadata.
            </p>
          </div>
        </div>
      )}

      {/* Success Banner & Metadata */}
      <div className="bg-[#111827] border-b border-white/[0.08] p-6 flex items-start justify-between">
        <div className="flex gap-4">
          <div className="bg-[#18E6A8]/10 p-3 rounded-2xl h-fit border border-[#18E6A8]/20">
            <CheckCircle2 className="h-6 w-6 text-[#18E6A8]" />
          </div>
          <div>
            <h3 className="text-[#18E6A8] font-bold text-base mb-1">
              {isFallback ? 'Fallback Patch Available' : 'Patch generated successfully'}
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#94A3B8] font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#18E6A8]" /> Generated {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-[#18E6A8]" /> AI Model:{' '}
                {isFallback
                  ? 'Fallback Engine'
                  : patch?.ai_response_json
                  ? 'llama-3.3-70b-versatile'
                  : 'Unknown'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#18E6A8]" /> Verification Status:{' '}
                {patch?.status === 'REJECTED' ? 'Failed' : 'Passed'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className="text-xs text-[#18E6A8] hover:text-[#34D399] font-mono font-bold px-4 py-2 rounded-xl hover:bg-[#18E6A8]/10 border border-transparent hover:border-[#18E6A8]/20 transition-all"
        >
          Regenerate Patch
        </button>
      </div>

      {/* PR Style Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-6 border-b border-white/[0.08] bg-[#151E2D] shrink-0 gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2.5">
            <GitCommit className="h-5 w-5 text-[#18E6A8]" />
            {patch?.ai_response_json?.pr_title || 'AI Generated Security Patch'}
          </h2>
          <div className="text-xs text-[#94A3B8] mt-2 mb-3 max-w-2xl leading-relaxed">
            {patch?.ai_response_json?.pr_description ||
              patch?.explanation ||
              'A secure patch has been automatically synthesized to resolve identified vulnerabilities.'}
          </div>
          <div className="text-xs text-[#94A3B8] flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1 text-[#18E6A8] font-bold">
              +{linesAdded} additions
            </span>
            <span className="flex items-center gap-1 text-[#F05B68] font-bold">
              -{linesRemoved} deletions
            </span>
            <span className="flex items-center gap-1 text-[#18E6A8] bg-[#18E6A8]/10 px-2.5 py-0.5 rounded-full border border-[#18E6A8]/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              {patch?.ai_response_json?.breaking_change ? 'High Merge Risk' : 'Low Merge Risk'}
            </span>
          </div>
        </div>

        {/* Diff Toolbar */}
        <div className="flex items-center gap-2 font-mono">
          <div className="flex bg-[#111827] rounded-xl border border-white/[0.08] p-1 gap-1">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'unified'
                  ? 'bg-[#151E2D] text-[#F8FAFC] border border-white/[0.08]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'split'
                  ? 'bg-[#151E2D] text-[#F8FAFC] border border-white/[0.08]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Split
            </button>
          </div>

          <button
            className="h-8 w-8 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] bg-[#111827] border border-white/[0.08] hover:bg-[#151E2D] rounded-xl transition-colors"
            title="Copy Patch"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] bg-[#111827] border border-white/[0.08] hover:bg-[#151E2D] rounded-xl transition-colors"
            title="Download .patch"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Diff Viewer */}
      <div className="flex-1 overflow-auto bg-[#070B16] p-6 custom-scrollbar">
        {parsedLines.length > 0 ? (
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#111827] shadow-[0_8px_32px_rgba(0,0,0,0.36)] font-mono">
            {parsedLines.map((l, i) => {
              if (l.type === 'header') {
                return (
                  <div
                    key={i}
                    className="flex bg-[#151E2D] text-[#94A3B8] font-mono text-xs py-2 px-4 border-b border-white/[0.08]"
                  >
                    {l.line}
                  </div>
                );
              }

              const isAdd = l.type === 'addition';
              const isDel = l.type === 'deletion';

              return (
                <div
                  key={i}
                  className={`flex font-mono text-xs leading-relaxed ${
                    isAdd ? 'bg-[#18E6A8]/10' : isDel ? 'bg-[#F05B68]/10' : ''
                  }`}
                >
                  <div className="flex w-[100px] shrink-0 select-none text-right text-[#64748B] border-r border-white/[0.08]">
                    <div
                      className={`w-1/2 pr-2 py-1 ${
                        isDel ? 'bg-[#F05B68]/20 text-[#F05B68]' : isAdd ? 'bg-[#18E6A8]/10' : ''
                      }`}
                    >
                      {l.oldL !== -1 ? l.oldL : ''}
                    </div>
                    <div
                      className={`w-1/2 pr-2 py-1 border-l border-white/[0.08] ${
                        isAdd ? 'bg-[#18E6A8]/20 text-[#18E6A8]' : isDel ? 'bg-[#F05B68]/10' : ''
                      }`}
                    >
                      {l.newL !== -1 ? l.newL : ''}
                    </div>
                  </div>

                  <div
                    className={`flex-1 pl-4 py-1 whitespace-pre-wrap ${
                      isAdd ? 'text-[#18E6A8]' : isDel ? 'text-[#F05B68]' : 'text-[#F8FAFC]'
                    }`}
                  >
                    {l.line}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#111827] border border-white/[0.08] rounded-2xl max-w-md mx-auto my-12 font-sans">
            <AlertTriangle className="h-8 w-8 text-[#FBBF24] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#F8FAFC] mb-1">No patch content available</h4>
            <p className="text-xs text-[#94A3B8]">
              Patch generation completed but no diff content was returned.
            </p>
          </div>
        )}
      </div>

      {/* Fallback Fix Section */}
      {fallbackFix && (
        <div className="shrink-0 p-6 bg-[#070B16] border-t border-white/[0.08] font-sans">
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#151E2D]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#18E6A8]" />
                <h3 className="font-mono font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
                  Fallback Secure Fix
                </h3>
              </div>
              <span className="text-[10px] bg-[#111827] text-[#18E6A8] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/[0.08] font-mono font-bold">
                Fallback Generated
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-[#94A3B8] font-mono uppercase font-bold mb-1">Reason</h4>
                  <p className="text-xs text-[#F8FAFC] leading-relaxed">{fallbackFix.reason || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-[#94A3B8] font-mono uppercase font-bold mb-1">Limitations</h4>
                  <p className="text-xs text-[#F8FAFC] leading-relaxed">{fallbackFix.limitations || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-[#94A3B8] font-mono uppercase font-bold mb-1">Confidence</h4>
                  <span className="text-xs text-[#FBBF24] font-mono font-bold">{fallbackFix.confidence || 'Medium'}</span>
                </div>
              </div>

              <div className="space-y-4 font-mono">
                <div className="bg-[#151E2D] rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="bg-[#F05B68]/10 px-3 py-1.5 text-xs text-[#F05B68] border-b border-white/[0.08] flex items-center gap-2 font-bold">
                    <span className="w-4 h-4 flex items-center justify-center bg-[#F05B68]/20 text-[#F05B68] rounded">-</span> Before
                  </div>
                  <pre className="p-3 text-xs text-[#F8FAFC] overflow-x-auto">
                    {fallbackFix.before || ''}
                  </pre>
                </div>
                <div className="bg-[#151E2D] rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="bg-[#18E6A8]/10 px-3 py-1.5 text-xs text-[#18E6A8] border-b border-white/[0.08] flex items-center gap-2 font-bold">
                    <span className="w-4 h-4 flex items-center justify-center bg-[#18E6A8]/20 text-[#18E6A8] rounded">+</span> After
                  </div>
                  <pre className="p-3 text-xs text-[#18E6A8] overflow-x-auto">
                    {fallbackFix.after || ''}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="p-4 bg-[#151E2D] border-t border-white/[0.08] flex justify-end gap-3 shrink-0 mt-auto font-mono text-xs">
        <button
          onClick={onGenerate}
          className="px-4 py-2 font-semibold text-[#94A3B8] hover:text-[#F8FAFC] bg-[#111827] border border-white/[0.08] hover:bg-[#151E2D] rounded-xl transition-colors"
        >
          Discard Patch
        </button>
        <button
          onClick={onCreatePR}
          disabled={patch?.status === 'REJECTED' || isCreatingPR}
          className="flex items-center gap-2 px-5 py-2 font-bold text-[#070B16] bg-[#18E6A8] hover:bg-[#34D399] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-[#18E6A8]/20"
        >
          <GitPullRequest className="h-4 w-4 text-[#070B16]" />
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
