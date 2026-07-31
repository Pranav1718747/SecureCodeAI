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
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-400" />
            <span className="text-xl font-normal text-white tracking-tight">
              SecureCode <span className="font-serif italic text-emerald-400">AI</span>
            </span>
          </Link>

          {/* Right Action Group: Settings + Logout (gap: 16px) */}
          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className={clsx(
                'p-2 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-700',
                location.pathname.startsWith('/settings')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 transition-colors flex items-center justify-center"
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
