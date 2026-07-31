/** Page component for Settings: System configuration, AWS Bedrock API credentials, and integration settings page. */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Settings,
  User,
  Building2,
  Key,
  Cloud,
  Github,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Shield,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const SettingsPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeSection, setActiveSection] = useState('profile');
  const [showGithubPat, setShowGithubPat] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // Local form state
  const [profile, setProfile] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
  });

  const [awsConfig, setAwsConfig] = useState({
    region: localStorage.getItem('aws_region') || 'us-east-1',
    bedrockModelId: localStorage.getItem('aws_bedrock_model') || 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    sagemakerEndpoint: localStorage.getItem('aws_sagemaker_endpoint') || '',
    iamRoleArn: localStorage.getItem('aws_iam_role') || '',
  });

  const [githubPat, setGithubPat] = useState(localStorage.getItem('github_pat') || '');

  const [apiKeys] = useState([
    { id: '1', name: 'CI/CD Pipeline', prefix: 'sk-...a3f2', created: '2026-07-15', expires: '2027-07-15' },
    { id: '2', name: 'Integration Test', prefix: 'sk-...9d1c', created: '2026-07-20', expires: '2027-01-20' },
  ]);

  const sections: SettingsSection[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4 text-[#10B981]" /> },
    { id: 'organization', label: 'Organization', icon: <Building2 className="h-4 w-4 text-[#10B981]" /> },
    { id: 'apikeys', label: 'API Keys', icon: <Key className="h-4 w-4 text-[#10B981]" /> },
    { id: 'aws', label: 'AWS Configuration', icon: <Cloud className="h-4 w-4 text-[#10B981]" /> },
    { id: 'github', label: 'GitHub Integration', icon: <Github className="h-4 w-4 text-[#10B981]" /> },
  ];

  const handleSave = (section: string) => {
    if (section === 'aws') {
      localStorage.setItem('aws_region', awsConfig.region);
      localStorage.setItem('aws_bedrock_model', awsConfig.bedrockModelId);
      localStorage.setItem('aws_sagemaker_endpoint', awsConfig.sagemakerEndpoint);
      localStorage.setItem('aws_iam_role', awsConfig.iamRoleArn);
    } else if (section === 'github') {
      localStorage.setItem('github_pat', githubPat);
    }
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-8 pt-8 pb-12 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-white/[0.06] pb-6">
        <h1 className="text-3xl font-bold text-[#F8FAFC] flex items-center gap-3">
          <Settings className="h-7 w-7 text-[#10B981]" />
          System Settings
        </h1>
        <p className="text-[#94A3B8] text-xs mt-1">Manage your enterprise account, integrations, and system configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 max-w-3xl">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6 space-y-6">
              <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <User className="h-5 w-5 text-[#10B981]" />
                Profile Settings
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-sm focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/30 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-sm focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/30 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-[#0F172A]/50 border border-[#243244]/50 rounded-xl px-3.5 py-2.5 text-slate-500 text-sm cursor-not-allowed font-mono"
                />
                <p className="text-xs text-[#64748B] mt-1 font-mono">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Role</label>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-mono font-medium">
                  <Shield className="h-3.5 w-3.5 text-[#10B981]" />
                  {user?.role || 'DEVELOPER'}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => handleSave('profile')}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#34D399] text-slate-950 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm shadow-[#10B981]/20 transition-all"
                >
                  {saved === 'profile' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'profile' ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Organization Section */}
          {activeSection === 'organization' && (
            <div className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6 space-y-6">
              <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#10B981]" />
                Organization
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Organization Name</label>
                <input
                  type="text"
                  defaultValue="SecureCode AI Team"
                  className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-sm focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/30 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-3">Team Members</label>
                <div className="space-y-2">
                  {[
                    { name: user?.first_name + ' ' + (user?.last_name || ''), email: user?.email, role: 'Admin' },
                  ].map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#0F172A] border border-[#243244] rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] text-xs font-bold font-mono">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm text-[#F8FAFC] font-medium">{member.name}</p>
                          <p className="text-xs text-[#94A3B8] font-mono">{member.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="flex items-center gap-2 text-xs text-[#10B981] hover:text-[#34D399] font-medium transition-colors">
                <Plus className="h-4 w-4" />
                Invite Team Member
              </button>
            </div>
          )}

          {/* API Keys Section */}
          {activeSection === 'apikeys' && (
            <div className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#10B981]" />
                  API Keys
                </h2>
                <button className="flex items-center gap-2 bg-[#10B981] hover:bg-[#34D399] text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors">
                  <Plus className="h-4 w-4" />
                  Generate Key
                </button>
              </div>

              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between bg-[#0F172A] border border-[#243244] rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-[#F8FAFC] font-medium">{key.name}</p>
                      <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{key.prefix}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#94A3B8] font-mono">
                        Expires {key.expires}
                      </span>
                      <button className="text-red-400/60 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AWS Configuration Section */}
          {activeSection === 'aws' && (
            <div className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6 space-y-6">
              <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <Cloud className="h-5 w-5 text-[#10B981]" />
                AWS Configuration
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">AWS Region</label>
                <select
                  value={awsConfig.region}
                  onChange={(e) => setAwsConfig({ ...awsConfig, region: e.target.value })}
                  className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-sm focus:outline-none focus:border-[#10B981]/50 font-mono"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Bedrock Model ID</label>
                <select
                  value={awsConfig.bedrockModelId}
                  onChange={(e) => setAwsConfig({ ...awsConfig, bedrockModelId: e.target.value })}
                  className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-sm focus:outline-none focus:border-[#10B981]/50 font-mono"
                >
                  <option value="anthropic.claude-3-5-sonnet-20240620-v1:0">Claude 3.5 Sonnet</option>
                  <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
                  <option value="meta.llama3-70b-instruct-v1:0">Llama 3 70B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">SageMaker Endpoint</label>
                <input
                  type="text"
                  value={awsConfig.sagemakerEndpoint}
                  onChange={(e) => setAwsConfig({ ...awsConfig, sagemakerEndpoint: e.target.value })}
                  placeholder="securecodeai-qlora-endpoint"
                  className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-sm placeholder-slate-600 focus:outline-none focus:border-[#10B981]/50 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">IAM Role ARN</label>
                <input
                  type="text"
                  value={awsConfig.iamRoleArn}
                  onChange={(e) => setAwsConfig({ ...awsConfig, iamRoleArn: e.target.value })}
                  placeholder="arn:aws:iam::123456789012:role/SageMakerExecution"
                  className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 text-[#F8FAFC] text-sm placeholder-slate-600 focus:outline-none focus:border-[#10B981]/50 transition-all font-mono"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => handleSave('aws')}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#34D399] text-slate-950 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  {saved === 'aws' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'aws' ? 'Saved!' : 'Save Configuration'}
                </button>
              </div>
            </div>
          )}

          {/* GitHub Integration Section */}
          {activeSection === 'github' && (
            <div className="bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6 space-y-6">
              <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
                <Github className="h-5 w-5 text-[#10B981]" />
                GitHub Integration
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Personal Access Token (PAT)</label>
                <div className="relative">
                  <input
                    type={showGithubPat ? 'text' : 'password'}
                    value={githubPat}
                    onChange={(e) => setGithubPat(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#0F172A] border border-[#243244] rounded-xl px-3.5 py-2.5 pr-10 text-[#F8FAFC] placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-[#10B981]/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGithubPat(!showGithubPat)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showGithubPat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1.5 font-mono">
                  Required for automatic Pull Request creation. Needs <code className="text-[#10B981]">repo</code> scope.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#0F172A] border border-[#243244] rounded-xl px-4 py-3">
                <RefreshCw className="h-4 w-4 text-[#10B981]" />
                <div>
                  <p className="text-sm text-[#F8FAFC]">Webhook Configuration</p>
                  <p className="text-xs text-[#94A3B8]">Configure webhooks for automatic scanning on push events</p>
                </div>
                <span className="ml-auto text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-mono">
                  Coming Soon
                </span>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => handleSave('github')}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#34D399] text-slate-950 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  {saved === 'github' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'github' ? 'Saved!' : 'Save Integration'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
