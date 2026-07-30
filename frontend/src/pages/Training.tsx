import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, Play, BrainCircuit, Server, Key, History } from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import { fetchJobs, triggerTraining } from '../store/trainingSlice';
import { TrainingProgress } from '../components/TrainingProgress';
import { Button, Card, CardHeader, CardContent } from '../components/Common';

export const TrainingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, triggering, loading } = useSelector((state: RootState) => state.training);
  const [baseModel, setBaseModel] = useState('Mistral-7B-Instruct-v0.2');

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleTrigger = async () => {
    await dispatch(triggerTraining({ datasetId: 'auto-dataset', baseModel }));
  };

  const activeJob = jobs.find(j => j.status === 'STARTING' || j.status === 'IN_PROGRESS');
  const pastJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'FAILED');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-purple-500" />
            Model Fine-Tuning
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage and train underlying LLMs using AWS SageMaker QLoRA</p>
        </div>
        <Button
          onClick={handleTrigger}
          isLoading={triggering}
          disabled={!!activeJob}
          icon={Play}
          className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 shadow-purple-500/20"
        >
          Trigger Fine-Tuning
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeJob ? (
            <TrainingProgress job={activeJob} />
          ) : (
            <Card className="border-dashed border-slate-700 bg-slate-900/30">
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-300 mb-1">No Active Jobs</h3>
                <p className="text-sm">Trigger a fine-tuning job to improve AI patch quality.</p>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Job History" icon={<History className="h-5 w-5 text-slate-400" />} />
            <CardContent className="p-0">
              {loading && pastJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Loading history...</div>
              ) : pastJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No past training jobs found.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {pastJobs.map(job => (
                    <div key={job.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white">{job.sagemaker_job_name}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(job.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="AWS Configuration" icon={<Server className="h-5 w-5 text-orange-400" />} />
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Base Model</label>
                <select 
                  value={baseModel}
                  onChange={(e) => setBaseModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option>Mistral-7B-Instruct-v0.2</option>
                  <option>Llama-3-8B-Instruct</option>
                  <option>CodeLlama-13B</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                  <Key className="h-3.5 w-3.5" /> IAM Role ARN
                </label>
                <input 
                  type="text"
                  defaultValue="arn:aws:iam::123456789012:role/SageMakerExecution" 
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1.5">Configured in Settings page</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
