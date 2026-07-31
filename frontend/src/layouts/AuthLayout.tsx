import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#09111F] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-[#F8FAFC]">
          SecureCode AI
        </h2>
        <p className="mt-2 text-xs text-[#94A3B8] font-mono">
          Autonomous Security Engineering Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111827] py-8 px-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] sm:rounded-[20px] sm:px-10 border border-white/[0.06]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
