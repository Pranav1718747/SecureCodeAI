import React from 'react';
import { Search, BrainCircuit, ShieldAlert, GitCommit, Bot, CheckCircle2, RotateCw } from 'lucide-react';
import { classNames } from '../../utils/helpers';

interface AgentStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  description?: string;
}

export const AgentFlow: React.FC<{ currentStatus?: string }> = ({ currentStatus }) => {
  const steps: AgentStep[] = [
    {
      id: 'clone',
      label: 'Clone & Analyze',
      icon: Search,
      status: currentStatus === 'QUEUED' ? 'PENDING' : 'COMPLETED',
    },
    {
      id: 'detect',
      label: 'Heuristic Detection',
      icon: ShieldAlert,
      status: currentStatus === 'IN_PROGRESS' ? 'ACTIVE' : (currentStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING'),
    },
    {
      id: 'critic',
      label: 'AI Critic Verification',
      icon: BrainCircuit,
      status: currentStatus === 'IN_PROGRESS' ? 'ACTIVE' : (currentStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING'),
    },
    {
      id: 'patch',
      label: 'Patch Generation',
      icon: GitCommit,
      status: currentStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Bot className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Multi-Agent Workflow</h3>
          <p className="text-sm text-slate-400">Live orchestration status</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-[21px] w-px bg-slate-800" />
        
        <div className="space-y-6 relative">
          {steps.map((step) => {
            const isActive = step.status === 'ACTIVE';
            const isCompleted = step.status === 'COMPLETED';

            return (
              <div key={step.id} className="flex items-start gap-4">
                <div className="relative z-10">
                  <div
                    className={classNames(
                      'w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors duration-500',
                      isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                      isActive ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                      'bg-slate-900 border-slate-800 text-slate-600'
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : 
                     isActive ? <RotateCw className="h-5 w-5 animate-spin" /> : 
                     <step.icon className="h-5 w-5" />}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className={classNames(
                    'text-sm font-medium transition-colors',
                    isCompleted ? 'text-emerald-400' :
                    isActive ? 'text-blue-400' :
                    'text-slate-500'
                  )}>
                    {step.label}
                  </h4>
                  {isActive && (
                    <div className="mt-2 h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse w-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
