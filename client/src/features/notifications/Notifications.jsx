import { Link, useNavigate } from 'react-router';

import { Bell, X } from 'lucide-react';

import { Button, EmptyState, SkeletonCard } from '../../components/primitives/index.js';
import { FilterChips } from '../../components/shared/FilterChips.jsx';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { useFilterParams } from '../../lib/useFilterParams.js';
import { useZone } from '../auth/queries.js';
import { useDismiss, useMarkAllRead, useMarkRead, useNotifications } from './queries.js';
import { FILTERS, groupByRecency, kindOf, routeFor } from './meta.js';
import { fmtStamp } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export const Notifications = () => {
  const tz = useZone();
  const [{ filter }, update] = useFilterParams('notifications', ['filter']);

  const { data, isPending } = useNotifications(filter);
  const markAllRead = useMarkAllRead();

  const change = (value) => update({ filter: value });

  const unread = data?.unreadCount ?? 0;
  const groups = data ? groupByRecency(data.items, tz) : [];

  return (
    <div className="mx-auto max-w-page">
      <PageHeader
        title="Notifications"
        sub={isPending ? ' ' : unread ? `${unread} unread notification${unread === 1 ? '' : 's'}` : "You're all caught up."}
        actions={
          <>
            <Button variant="secondary" size="md" disabled={!unread} loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
              Mark all as read
            </Button>
            <Link to="/settings?tab=notifications">
              <Button variant="secondary" size="md" tabIndex={-1}>Notification settings</Button>
            </Link>
          </>
        }
      />

      <FilterChips
        options={FILTERS}
        value={filter}
        onChange={change}
        counts={{ unread }}
        className="mb-5"
      />

      {isPending ? (
        <div className="flex flex-col gap-3.5"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div>
      ) : groups.length === 0 ? (
        <div className="rounded-card border border-line-card bg-surface-card">
          <EmptyState
            icon={Bell}
            title={filter === 'all' ? 'No notifications' : `Nothing under ${FILTERS.find((f) => f.value === filter)?.label}`}
            body="Updates about your applications, interviews and messages arrive here."
            action={filter !== 'all' && <Button variant="secondary" onClick={() => change('all')}>Show all notifications</Button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-2.5 text-overline font-medium uppercase tracking-[0.08em] text-ink-muted">
                {group.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {group.items.map((n) => <NotificationCard key={n.slug} notification={n} tz={tz} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationCard = ({ notification: n, tz }) => {
  const navigate = useNavigate();
  const markRead = useMarkRead();
  const dismiss = useDismiss();

  const { icon: Icon, tile } = kindOf(n.kind);
  const unread = !n.readAt;
  const to = routeFor(n.action);

  // Clicking the action marks it read and routes to the target.
  const act = () => {
    markRead.mutate(n.slug);
    if (to) navigate(to);
  };

  return (
    <article
      className={cn(
        'flex gap-3.5 rounded-card border px-[18px] py-4',
        unread ? 'border-accent-tintStrong bg-accent-row' : 'border-line-card bg-surface-card'
      )}
    >
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-control', tile)}>
        <Icon aria-hidden="true" size={17} strokeWidth={1.6} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span className={cn('text-item text-ink', unread ? 'font-semibold' : 'font-medium')}>{n.title}</span>
          {unread && <span aria-label="Unread" className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />}
        </p>
        {n.body && <p className="mt-1.5 max-w-[62ch] text-body-sm text-ink-secondary">{n.body}</p>}
        <p className="mt-1.5 text-meta text-ink-muted">
          {[n.contextLabel, fmtStamp(n.createdAt, tz)].filter(Boolean).join(' · ')}
        </p>

        {n.action?.label && to && (
          <Button variant="secondary" size="sm" className="mt-3" onClick={act}>
            {n.action.label}
          </Button>
        )}
      </div>

      <button
        type="button"
        aria-label={`Dismiss ${n.title}`}
        onClick={() => dismiss.mutate(n.slug)}
        className="-mr-1 -mt-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-icon text-ink-subtle transition-[background-color,color] duration-control hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
    </article>
  );
};
