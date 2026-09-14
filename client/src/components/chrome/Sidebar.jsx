import { NavLink, useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { Button } from '../primitives/index.js';
import { cn } from '../../lib/cn.js';
import { NAV } from './nav.js';

export const navItemClass = ({ isActive }) =>
  cn(
    'flex h-ctl-lg items-center gap-[11px] rounded-control px-2.5 text-[13px] font-medium',
    'transition-[background-color,color] duration-control',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    isActive
      ? 'bg-accent-tint text-accent-hover'
      : 'text-ink-secondary hover:bg-surface-hover hover:text-ink'
  );

export const NavItems = ({ messageCount = 0, onNavigate }) => (
  <nav className="flex flex-col gap-0.5">
    {NAV.map(({ to, label, icon: Icon, end, badge }) => (
      <NavLink key={to} to={to} end={end} className={navItemClass} onClick={onNavigate}>
        <Icon aria-hidden="true" size={18} strokeWidth={1.6} className="shrink-0" />
        <span className="flex-1">{label}</span>
        {badge === 'messages' && messageCount > 0 && <CountBadge count={messageCount} />}
      </NavLink>
    ))}
  </nav>
);

export const CountBadge = ({ count, className }) => (
  <span
    className={cn(
      'flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white',
      className
    )}
  >
    {count}
  </span>
);

export const SidebarFooter = ({ onNavigate, onLogout }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-4 border-t border-line-inner pt-4">
      <p className="text-[12px] font-medium leading-none text-ink">Need help?</p>
      <div className="mt-3 flex flex-col items-start gap-2">
        <NavLink to="/help" onClick={onNavigate} className="text-body-sm text-ink-secondary hover:text-ink">
          Candidate FAQ
        </NavLink>
        <NavLink to="/messages" onClick={onNavigate} className="text-body-sm text-ink-secondary hover:text-ink">
          Contact Recruiting
        </NavLink>
      </div>
      <Button
        variant="secondary"
        size="md"
        fullWidth
        className="mt-3.5"
        onClick={() => { onNavigate?.(); navigate('/help'); }}
      >
        Help Center
      </Button>

      <button
        type="button"
        onClick={() => { onNavigate?.(); onLogout?.(); }}
        className="mt-4 flex items-center gap-[11px] rounded-control px-2.5 py-2 text-body-sm text-ink-secondary transition-[background-color,color] duration-control hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <LogOut aria-hidden="true" size={16} strokeWidth={1.6} />
        Log out
      </button>
    </div>
  );
};

// Fixed left column, its own scroll region so a long nav never clips.
export const Sidebar = ({ messageCount, onLogout }) => (
  <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-[232px] flex-col overflow-y-auto border-r border-line-card bg-surface-card px-3.5 pb-5 pt-5 app:flex">
    <NavItems messageCount={messageCount} />
    <div className="mt-auto">
      <SidebarFooter onLogout={onLogout} />
    </div>
  </aside>
);
