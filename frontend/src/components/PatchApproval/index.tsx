import React, { useState } from 'react';
import { Check, X, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '../Common';
import { DiffViewer } from '../DiffViewer';
import type { Patch } from '../../types/scan';

interface PatchApprovalProps {
  patch: Patch;
  onApprove: (patchId: string) => Promise<void>;
  onReject: (patchId: string, reason: string) => Promise<void>;
  onCreatePR: (patchId: string) => Promise<void>;
  isApplying?: boolean;
}

export const PatchApproval: React.FC<PatchApprovalProps> = ({
  patch,
  onApprove,
  onReject,
  onCreatePR,
  isApplying = false,
}) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await onReject(patch.id, rejectReason);
    setRejectMode(false);
    setRejectReason('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            AI Generated Fix
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {patch.status}
            </span>
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {patch.status === 'GENERATED' && !rejectMode && (
            <>
              <Button size="sm" variant="danger" icon={X} onClick={() => setRejectMode(true)} disabled={isApplying}>
                Reject
              </Button>
              <Button size="sm" variant="secondary" icon={Check} onClick={() => onApprove(patch.id)} isLoading={isApplying}>
                Approve (Local)
              </Button>
              <Button size="sm" variant="primary" icon={ExternalLink} onClick={() => onCreatePR(patch.id)} isLoading={isApplying}>
                Create PR
              </Button>
            </>
          )}
        </div>
      </div>

      {rejectMode && (
        <div className="p-4 bg-red-500/5 border-b border-red-500/10 space-y-3">
          <label className="block text-sm font-medium text-red-400">Reason for Rejection</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Why is this patch incorrect? This helps train the AI model..."
            className="w-full h-20 bg-slate-950 border border-red-500/20 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setRejectMode(false)}>Cancel</Button>
            <Button size="sm" variant="danger" icon={MessageSquare} onClick={handleReject}>Submit Feedback</Button>
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-950/50 border-b border-slate-800">
        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Explanation</h5>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{patch.explanation}</p>
      </div>

      <div className="p-4 bg-slate-950">
        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Code Changes</h5>
        <DiffViewer diff={patch.diff_content} />
      </div>
    </div>
  );
};
