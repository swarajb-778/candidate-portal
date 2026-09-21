import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, MessageSquare } from 'lucide-react';

import { EmptyState, Skeleton } from '../../components/primitives/index.js';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { useThreads, useZone } from '../auth/queries.js';
import { useMarkRead, useThread } from './queries.js';
import { Composer } from './Composer.jsx';
import { fmtDayShort, fmtTime, fmtWeekdayShort } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

// One component, two layouts. Above `app:` both panes sit side by side inside a
// single card. Below it they are separate routes: /messages is the list,
// /messages/:slug is the conversation with a back arrow in its place.
export const Messages = () => {
  const { slug } = useParams();
  const threads = useThreads();

  return (
    <div className="mx-auto max-w-page-full">
      <PageHeader title="Messages" sub="Communicate with your recruiting team." />

      <div className="flex overflow-hidden rounded-card border border-line-card bg-surface-card">
        <div
          className={cn(
            'w-full shrink-0 app:w-[320px] app:border-r app:border-line-card',
            slug ? 'hidden app:block' : 'block'
          )}
        >
          <ThreadList threads={threads} activeSlug={slug} />
        </div>

        {/* With no threads at all, "Select a conversation" would be inviting
            the reader to do something impossible — the list's own empty state
            covers it. */}
        {(slug || threads.data?.items?.length > 0) && (
          <div className={cn('min-w-0 flex-1', slug ? 'block' : 'hidden app:block')}>
            {slug ? <Conversation slug={slug} /> : <NoThreadSelected />}
          </div>
        )}
      </div>
    </div>
  );
};

const ThreadList = ({ threads, activeSlug }) => {
  const tz = useZone();

  if (threads.isPending) {
    return (
      <div className="p-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="mb-3 h-16 w-full" />)}
      </div>
    );
  }

  if (!threads.data.items.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No conversations yet"
        body="When a recruiter gets in touch, the thread shows up here."
      />
    );
  }

  return (
    <ul>
      {threads.data.items.map((t) => (
        <li key={t.slug}>
          <Link
            to={`/messages/${t.slug}`}
            className={cn(
              'flex gap-3 border-b border-line-list p-4 transition-[background-color] duration-control',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
              t.slug === activeSlug ? 'bg-accent-row' : 'hover:bg-surface-hover'
            )}
          >
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-accent-tint text-[12.5px] font-semibold text-accent-hover">
              {t.participant.initials}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-label-lg font-medium text-ink">{t.participant.name}</span>
                <span className="shrink-0 text-meta-xs text-ink-muted">{fmtDayShort(t.lastMessageAt, tz)}</span>
              </span>
              <span className="mt-1 block text-meta text-ink-muted">{t.participant.role}</span>
              <span className="mt-1.5 flex items-center gap-2">
                <span className="truncate text-meta-lg text-ink-secondary">{t.lastMessagePreview}</span>
                {t.unreadCount > 0 && (
                  <span aria-label="Unread" className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
                )}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const NoThreadSelected = () => (
  <EmptyState
    icon={MessageSquare}
    title="Select a conversation"
    body="Pick a thread on the left to read it and reply."
  />
);

const Conversation = ({ slug }) => {
  const tz = useZone();
  const { data, isPending } = useThread(slug);
  const markRead = useMarkRead();
  const bottomRef = useRef(null);

  // Opening a thread clears its unread count.
  useEffect(() => { if (slug) markRead.mutate(slug); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [data?.items?.length]);

  if (isPending) {
    return <div className="p-card"><Skeleton className="h-20 w-2/3" /><Skeleton className="mt-4 h-20 w-1/2" /></div>;
  }

  return (
    // Bounded height so the message list scrolls inside the card and the
    // composer stays reachable — otherwise on mobile you scroll past the whole
    // history to reach the input.
    <div className="flex h-[calc(100dvh-230px)] min-h-[380px] flex-col app:h-[600px]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line-inner bg-surface-card p-4">
        <Link
          to="/messages"
          aria-label="Back to conversations"
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-icon text-ink-secondary transition-[background-color,color] duration-control hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent app:hidden"
        >
          <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.6} />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-item font-semibold text-ink">{data.thread.participant.name}</p>
          <p className="mt-1 text-meta text-ink-muted">
            {data.thread.participant.role}
            {data.thread.application && (
              <>
                {' · '}
                <Link to={`/applications/${data.thread.application.slug}`} className="text-accent hover:text-accent-hover">
                  {data.thread.application.title}
                </Link>
              </>
            )}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList items={data.items} tz={tz} />
        <div ref={bottomRef} />
      </div>

      <Composer slug={slug} />
    </div>
  );
};

const MessageList = ({ items, tz }) => {
  let lastDay = null;

  return (
    <ol className="flex flex-col gap-3">
      {items.map((m) => {
        const day = fmtDayShort(m.sentAt, tz);
        const showSeparator = day !== lastDay;
        lastDay = day;

        return (
          <li key={m._id}>
            {showSeparator && <DateSeparator label={fmtWeekdayShort(m.sentAt, tz)} />}
            <div className={cn('flex flex-col', m.fromCandidate ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'max-w-[62ch] rounded-card px-3.5 py-2.5 text-body-sm',
                  m.fromCandidate
                    ? 'rounded-br-[4px] bg-accent text-white'
                    : 'rounded-bl-[4px] bg-neutral-pill text-ink',
                  m.pending && 'opacity-70'
                )}
              >
                {m.body}
              </div>
              <span className="mt-1 text-meta-xs text-ink-muted">{fmtTime(m.sentAt, tz)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const DateSeparator = ({ label }) => (
  <div className="my-4 flex items-center gap-3 first:mt-0">
    <span className="h-px flex-1 bg-line-list" />
    <span className="text-overline-sm font-medium uppercase text-ink-muted">{label}</span>
    <span className="h-px flex-1 bg-line-list" />
  </div>
);
