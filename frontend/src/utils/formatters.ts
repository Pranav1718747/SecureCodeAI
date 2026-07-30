/** Utility functions for date formatting, code snippet trimming, and severity badge colors. */

/**
 * Format an ISO date string into a human-readable format.
 */
export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a relative time string (e.g., "2 hours ago").
 */
export const formatRelativeTime = (iso: string): string => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(iso);
};

/**
 * Map severity level to a Tailwind badge color class.
 */
export const severityColor = (level: string): string => {
  const map: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    INFO: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return map[level?.toUpperCase()] || map.INFO;
};

/**
 * Map scan status to a color class.
 */
export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    COMPLETED: 'text-emerald-400',
    IN_PROGRESS: 'text-blue-400',
    PENDING: 'text-yellow-400',
    FAILED: 'text-red-400',
    QUEUED: 'text-slate-400',
  };
  return map[status?.toUpperCase()] || 'text-slate-400';
};

/**
 * Truncate a code snippet to a maximum number of lines.
 */
export const truncateSnippet = (code: string, maxLines = 10): string => {
  const lines = code.split('\n');
  if (lines.length <= maxLines) return code;
  return lines.slice(0, maxLines).join('\n') + '\n// ...truncated';
};

/**
 * Format a number as a percentage string.
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format a large number with K/M suffixes.
 */
export const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};
