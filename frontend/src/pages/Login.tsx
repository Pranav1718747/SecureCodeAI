import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';
import { Shield } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    const resultAction = await dispatch(login({ email, password }));
    
    if (login.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <Shield className="h-12 w-12 text-[#10B981]" />
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs font-mono">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-medium text-[#94A3B8]">
            Email address
          </label>
          <div className="mt-1.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3.5 py-2.5 border border-[#243244] rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 focus:border-[#10B981]/50 bg-[#0F172A] text-[#F8FAFC] sm:text-xs transition-colors font-mono"
              placeholder="admin@securecode-ai.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#94A3B8]">
            Password
          </label>
          <div className="mt-1.5">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3.5 py-2.5 border border-[#243244] rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 focus:border-[#10B981]/50 bg-[#0F172A] text-[#F8FAFC] sm:text-xs transition-colors font-mono"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-slate-950 bg-[#10B981] hover:bg-[#34D399] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] focus:ring-offset-[#09111F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Authenticating...' : 'Sign in to Enterprise SOC'}
          </button>
        </div>
      </form>
    </div>
  );
};
