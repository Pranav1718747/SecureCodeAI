import React from 'react';
import { Brain, Cpu, Database, Activity, CheckCircle2, Clock } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import type { FineTuningJob } from '../../store/trainingSlice';

interface TrainingProgressProps {
  job: FineTuningJob;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({ job }) => {
  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'STARTING': return '15%';
      case 'IN_PROGRESS': return '65%';
      case 'COMPLETED': return '100%';
      case 'FAILED': return '100%';
      default: return '0%';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500';
      case 'FAILED': return 'bg-red-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const statusText = {
    'STARTING': 'Initializing SageMaker cluster...',
    'IN_PROGRESS': 'Fine-tuning QLoRA adapters on feedback dataset...',
    'COMPLETED': 'Model successfully fine-tuned and deployed.',
    'FAILED': 'Training job failed. Check AWS CloudWatch logs.',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-lg">
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Active Training Job</h3>
            <p className="text-sm text-slate-400 font-mono mt-0.5">{job.sagemaker_job_name}</p>
          </div>
        </div>
        <div className={classNames(
          'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5',
          job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
          job.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        )}>
          {job.status === 'IN_PROGRESS' && <Activity className="h-3.5 w-3.5 animate-pulse" />}
          {job.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}
          {job.status === 'STARTING' && <Clock className="h-3.5 w-3.5" />}
          {job.status}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progress Phase</span>
            <span className="text-slate-300 font-medium">{statusText[job.status]}</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={classNames('h-full transition-all duration-1000 ease-out', getStatusColor(job.status))}
              style={{ width: getProgressWidth(job.status) }}
            >
              {job.status === 'IN_PROGRESS' && (
                <div className="w-full h-full bg-white/20 animate-[pulse_2s_ease-in-out_infinite]" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Database className="h-4 w-4" />
              <span className="text-xs uppercase font-semibold tracking-wider">Dataset</span>
            </div>
            <p className="text-sm text-white font-medium">Feedback DB (Delta)</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Cpu className="h-4 w-4" />
              <span className="text-xs uppercase font-semibold tracking-wider">Base Model</span>
            </div>
            <p className="text-sm text-white font-medium">{job.base_model}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs uppercase font-semibold tracking-wider">Started</span>
            </div>
            <p className="text-sm text-white font-medium">{new Date(job.created_at).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
