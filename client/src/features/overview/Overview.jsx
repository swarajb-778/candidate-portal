import { Link, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { AlertCircle } from 'lucide-react';

import { Button, Card, CardHeader, SkeletonCard, StatusPill } from '../../components/primitives/index.js';
import { StageBar } from '../../components/shared/StageBar.jsx';
import { openModal } from '../../store/slices/ui.js';
import { useMe, useThreads, useZone } from '../auth/queries.js';
import { useApplications } from '../applications/queries.js';
import { useAvailabilityRequest, useInterviews } from '../interviews/queries.js';
import { NextInterviewCard, CurrentStageCard } from './OverviewRail.jsx';
import { dotted, fmtCalendarShort, fmtDayShort, fmtDate, fmtStamp } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const IN_FLIGHT = ['Draft', 'Submitted', 'Under Review', 'Interview', 'Offer'];

export const Overview = () => {
  const { data: me } = useMe();
  const tz = useZone();
  const applications = useApplications();
  const interviews = useInterviews('upcoming');
  const availability = useAvailabilityRequest();
  const threads = useThreads();

  const nextInterview = interviews.data?.items?.[0];
  const items = applications.data?.items ?? [];
  // The rail follows whichever application is furthest along and still open.
  const focus = items.find((a) => a.slug === nextInterview?.application?.slug)
    ?? items.find((a) => IN_FLIGHT.includes(a.status));

  return (
    <div className="mx-auto max-w-page-full">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {/* The one emoji in the product. */}
          <h1 className="text-[clamp(21px,2.4vw,26px)] font-semibold leading-[1.2] tracking-[-0.018em] text-ink">
            Hi {me?.firstName} 👋
          </h1>
          <p className="mt-2 text-body-lg text-ink-secondary">
            Welcome to your candidate portal. Here's the latest on your applications.
          </p>
        </div>
        <p className="text-meta-xs text-ink-muted">
          Last updated: {fmtStamp(new Date().toISOString(), tz)}
        </p>
      </header>

      <div className="flex flex-wrap items-start gap-[clamp(14px,1.8vw,22px)]">
        <div className="flex min-w-[320px] flex-[1_1_560px] flex-col gap-3.5">
          {availability.data && <ActionCard request={availability.data} />}
          <ApplicationsCard query={applications} tz={tz} nextInterview={nextInterview} />
          <MessagesCard query={threads} tz={tz} />
          <MetricTiles
            applications={applications.data}
            interviewCount={interviews.data?.items?.length ?? 0}
            actionCount={availability.data ? 1 : 0}
          />
        </div>

        <div className="flex w-full flex-col gap-3.5 app:w-[380px] app:shrink-0">
          <NextInterviewCard interview={nextInterview} tz={tz} />
          <CurrentStageCard application={focus} interview={nextInterview} tz={tz} />
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ request }) => {
  const dispatch = useDispatch();
  return (
    <Card className="border-warning-border bg-warning-bgAlt">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-overline font-medium uppercase text-warning">
            <AlertCircle aria-hidden="true" size={15} strokeWidth={1.8} />
            Action required
          </p>
          <h2 className="mt-2.5 text-card-title font-semibold text-ink">Complete interview availability</h2>
          <p className="mt-1.5 text-body-sm text-ink-secondary">
            {request.application?.title} — {request.application?.team}
          </p>
          <p className="mt-2 text-meta-lg text-warning-text">
            Requested by Recruiting · Due {fmtCalendarShort(request.dueAt)}
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="primary"
            size="lg"
            onClick={() => dispatch(openModal({ modal: 'availability', payload: { mode: 'avail' } }))}
          >
            Submit availability
          </Button>
          <p className="mt-2 text-center text-meta text-ink-muted">Takes about 2 minutes</p>
        </div>
      </div>
    </Card>
  );
};

const ApplicationsCard = ({ query, tz, nextInterview }) => (
  <Card>
    <CardHeader
      title="My Applications"
      action={<Link to="/applications" className="text-label-lg font-medium text-accent hover:text-accent-hover">View all →</Link>}
    />

    {query.isPending ? (
      <div className="mt-3.5 space-y-3.5"><SkeletonCard lines={3} className="border-0 p-0" /></div>
    ) : query.data.items.length === 0 ? (
      <p className="mt-3.5 text-body-sm text-ink-secondary">
        No applications yet. When you apply to a role, it appears here.
      </p>
    ) : (
      <ul className="mt-1">
        {query.data.items.slice(0, 3).map((a) => {
          const open = IN_FLIGHT.includes(a.status);
          const iv = nextInterview?.application?.slug === a.slug ? nextInterview : null;
          return (
            <li key={a.slug} className="border-t border-line-list py-4 first:border-t-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn('text-item font-semibold', open ? 'text-ink' : 'text-ink-muted')}>{a.title}</p>
                  <p className="mt-1 text-body-sm text-ink-secondary">{a.team}</p>
                  <p className="mt-1.5 text-meta text-ink-muted">
                    {dotted(a.location, a.employmentType, `Applied ${fmtDate(a.appliedAt, tz)}`)}
                  </p>
                </div>
                <StatusPill status={a.status} label={a.stageLabel} />
              </div>

              {open && (
                <>
                  <StageBar status={a.status} className="mt-3.5" />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-meta-lg text-ink-secondary">
                      {iv ? `Next: Panel interview ${fmtDayShort(iv.startsAt, tz)}` : 'Recruiting will be in touch with the next step.'}
                    </p>
                    <Link to={`/applications/${a.slug}`} className="text-label-lg font-medium text-accent hover:text-accent-hover">
                      View application →
                    </Link>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);

const MessagesCard = ({ query, tz }) => (
  <Card>
    <CardHeader
      title="Recent messages"
      action={<Link to="/messages" className="text-label-lg font-medium text-accent hover:text-accent-hover">View all →</Link>}
    />

    {query.data?.items?.length === 0 && (
      <p className="mt-3.5 text-body-sm text-ink-secondary">
        No messages yet. When a recruiter gets in touch, threads appear here.
      </p>
    )}

    <ul className="mt-1">
      {query.data?.items?.slice(0, 2).map((t) => (
        <li key={t.slug} className="border-t border-line-list py-3.5 first:border-t-0">
          <Link to={`/messages/${t.slug}`} className="flex items-start gap-3">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-accent-tint text-[12px] font-semibold text-accent-hover">
              {t.participant.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-label-lg font-medium text-ink">{t.participant.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-meta-xs text-ink-muted">
                  {fmtDayShort(t.lastMessageAt, tz)}
                  {t.unreadCount > 0 && <span aria-label="Unread" className="h-[7px] w-[7px] rounded-full bg-accent" />}
                </span>
              </span>
              <span className="mt-1.5 block truncate text-meta-lg text-ink-secondary">{t.lastMessagePreview}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </Card>
);

// Four counters. The prototype's LAYOUT switch moved these above the action
// card; per the README only the action-first order ships, so they sit here.
const MetricTiles = ({ applications, interviewCount, actionCount }) => {
  const counts = applications?.counts;
  if (!counts) return null;

  const tiles = [
    { n: counts.all, label: 'Applications', sub: 'Total submitted', accent: null },
    { n: counts.interview, label: 'Active process', sub: 'In interviews', accent: 'shadow-[inset_3px_0_0_0_theme(colors.accent.DEFAULT)]' },
    { n: interviewCount, label: 'Interviews', sub: 'Upcoming', accent: null },
    { n: actionCount, label: 'Action required', sub: 'Complete task', accent: 'shadow-[inset_3px_0_0_0_theme(colors.warning.DEFAULT)]' }
  ];

  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {tiles.map((t) => (
        <div key={t.label} className={cn('rounded-card border border-line-card bg-surface-card p-card', t.accent)}>
          <p className="text-[26px] font-semibold leading-none text-ink">{t.n}</p>
          <p className="mt-2.5 text-label-lg font-medium text-ink">{t.label}</p>
          <p className="mt-1 text-meta-xs text-ink-muted">{t.sub}</p>
        </div>
      ))}
    </div>
  );
};
