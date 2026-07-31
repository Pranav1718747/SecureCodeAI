import React from 'react';
import { LucideIcon } from 'lucide-react';
import { classNames } from '../../utils/helpers';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon: Icon, isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#10B981] text-slate-950 hover:bg-[#34D399] focus:ring-[#10B981] shadow-sm shadow-[#10B981]/20 font-semibold',
      secondary: 'bg-transparent text-[#F8FAFC] hover:bg-[#0F172A] focus:ring-slate-500 border border-[#243244]',
      danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 focus:ring-red-500 border border-red-500/20',
      ghost: 'bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A] focus:ring-slate-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classNames(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#09111F] disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : Icon ? (
          <Icon className={classNames(size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Card Component
export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={classNames('bg-[#111827] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.25)] rounded-[20px] p-6 overflow-hidden transition-all', className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode }> = ({ title, description, action, icon }) => (
  <div className="pb-4 mb-4 border-b border-white/[0.06] flex justify-between items-start">
    <div>
      <h3 className="text-base font-semibold text-[#F8FAFC] flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {description && <p className="text-xs text-[#94A3B8] mt-1">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={classNames('', className)}>{children}</div>
);

// Badge Component
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' | 'default'; className?: string }> = ({ children, variant = 'default', className }) => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    default: 'bg-[#0F172A] text-[#94A3B8] border-[#243244]',
  };
  
  return (
    <span className={classNames('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono', variants[variant], className)}>
      {children}
    </span>
  );
};
