import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '../primitives/index.js';
import { useZone } from '../../features/auth/queries.js';
import { useMarkAllRead, useMarkRead, useNotifications } from '../../features/notifications/queries.js';
import { kindOf, routeFor } from '../../features/notifications/meta.js';
import { fmtRelative } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export const NotifBell = ({ unreadCount = 0 }) => {
  const navigate = useNavigate();
  const tz = useZone();
  // Same query key the badge and the Notification Center use — there is no
  // separate "recent notifications" endpoint.
  const { data } = useNotifications('all');
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const recent = data?.items?.slice(0, 4) ?? [];

  const open = (n) => {
    const to = routeFor(n.action);
    markRead.mutate(n.slug);
    navigate(to ?? '/notifications');
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            iconOnly
            size="md"
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          >
            <Bell aria-hidden="true" size={18} strokeWidth={1.6} />
          </Button>
          {unreadCount > 0 && (
            <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[9.5px] font-semibold leading-none text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[348px] overflow-hidden rounded-card border border-line-menu bg-surface-card shadow-menu"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line-inner px-4 py-3">
            <span className="text-[13px] font-semibold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="text-label-lg font-medium text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Mark all as read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-body-sm text-ink-muted">You’re all caught up.</p>
          ) : (
            <ul>
              {recent.map((n) => {
                const unread = !n.readAt;
                const { dot } = kindOf(n.kind);
                return (
                  <li key={n.slug}>
                    <Dropdown.Item
                      onSelect={() => open(n)}
                      className={cn(
                        'flex cursor-pointer gap-2.5 border-b border-line-list px-4 py-3 outline-none',
                        'transition-[background-color] duration-control data-[highlighted]:bg-surface-hoverAlt',
                        unread && 'bg-accent-row'
                      )}
                    >
                      <span className={cn('mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full', unread ? dot : 'bg-neutral-dot')} />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-label-lg leading-snug text-ink', unread ? 'font-semibold' : 'font-medium')}>
                          {n.title}
                        </span>
                        <span className="mt-1 block text-meta leading-snug text-ink-muted">
                          {[n.contextLabel, fmtRelative(n.createdAt, tz)].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </Dropdown.Item>
                  </li>
                );
              })}
            </ul>
          )}

          <Dropdown.Item
            onSelect={() => navigate('/notifications')}
            className="flex h-11 cursor-pointer items-center justify-center text-label-lg font-medium text-accent outline-none transition-[background-color] duration-control data-[highlighted]:bg-surface-hoverAlt"
          >
            View all notifications
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
