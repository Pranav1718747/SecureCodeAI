import { useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { Shield, LogOut, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-[#070B16] border-b border-white/[0.08]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-[#18E6A8]" />
            <span className="text-xl font-mono font-bold text-[#F8FAFC] tracking-tight">
              SecureCode <span className="font-mono text-[#18E6A8]">AI</span>
            </span>
          </Link>

          {/* Right Action Group: Settings + Logout */}
          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className={clsx(
                'p-2 rounded-xl transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#10B981]/50',
                location.pathname.startsWith('/settings')
                  ? 'bg-[#111827] text-[#10B981] border border-white/[0.06]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
              )}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
