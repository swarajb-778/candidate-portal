import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { Bell, Calendar, FileText, Folder, Home, MessageSquare, MoreHorizontal, Settings, User } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { CountBadge } from './Sidebar.jsx';

const TABS = [
  { to: '/',             label: 'Overview',     icon: Home, end: true },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/interviews',   label: 'Interviews',   icon: Calendar },
  { to: '/messages',     label: 'Messages',     icon: MessageSquare, badge: true }
];

// The prototype shortcuts straight to Settings. The real build opens a sheet.
const MORE = [
  { to: '/documents',     label: 'Documents',     icon: Folder },
  { to: '/profile',       label: 'Profile',       icon: User },
  { to: '/settings',      label: 'Settings',      icon: Settings },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/help',          label: 'Help',          icon: FileText }
];

const tabClass = (active) =>
  cn(
    'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium',
    'transition-[color] duration-control',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
    active ? 'text-accent' : 'text-ink-secondary'
  );

export const MobileTabBar = ({ messageCount = 0 }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const moreActive = MORE.some((m) => pathname.startsWith(m.to));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-tabbar border-t border-line-card bg-surface-card app:hidden">
        {TABS.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => tabClass(isActive)}>
            <span className="relative">
              <Icon aria-hidden="true" size={18} strokeWidth={1.6} />
              {badge && messageCount > 0 && (
                <CountBadge count={messageCount} className="absolute -right-2.5 -top-1.5 h-4 min-w-[16px] text-[9.5px]" />
              )}
            </span>
            {label}
          </NavLink>
        ))}

        <button type="button" onClick={() => setMoreOpen(true)} className={tabClass(moreActive)} aria-haspopup="dialog">
          <MoreHorizontal aria-hidden="true" size={18} strokeWidth={1.6} />
          More
        </button>
      </nav>

      <Dialog.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim app:hidden" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-modal bg-surface-card p-card pb-8 focus:outline-none app:hidden">
            <Dialog.Title className="text-card-title font-semibold text-ink">More</Dialog.Title>
            <div className="mt-3.5 flex flex-col">
              {MORE.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => { setMoreOpen(false); navigate(to); }}
                  className="flex h-[52px] items-center gap-3 rounded-control px-2.5 text-body-lg text-ink transition-[background-color] duration-control hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.6} className="text-ink-secondary" />
                  {label}
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
