import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Calendar, Check, Clock, Video } from 'lucide-react';

import { Button, Card } from '../../components/primitives/index.js';
import { openModal, showToast } from '../../store/slices/ui.js';
import { fmtRangeShort, fmtTime, fmtWeekdayShort } from '../../lib/format.js';
import { zoneAbbr } from '../../lib/datetime.js';
import { cn } from '../../lib/cn.js';

const dayDiff = (iso) => Math.round((new Date(iso) - Date.now()) / 86_400_000);

const relativeDay = (iso) => {
  const d = dayDiff(iso);
  if (d < 0) return 'past';
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  return `in ${d} days`;
};

// Next interview — a card with an `ink` header strip, unlike every other card.
export const NextInterviewCard = ({ interview, tz }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  if (!interview) return null;

  const sessions = interview.sessions?.filter((s) => s.kind !== 'break') ?? [];
  const lead = sessions[0];
  const minutes = lead ? Math.round((new Date(lead.endsAt) - new Date(lead.startsAt)) / 60_000) : null;

  return (
    <div className="overflow-hidden rounded-card border border-line-card bg-surface-card">
      <div className="flex items-center justify-between gap-3 bg-ink px-[19px] py-[15px]">
        <span className="text-overline font-medium uppercase text-white">Next interview</span>
        <span className="text-overline text-[#8FB0FB]">{relativeDay(interview.startsAt)}</span>
      </div>

      <div className="p-card">
        <h2 className="text-item font-semibold text-ink">
          {lead?.title ?? (interview.kind === 'panel-day' ? 'Panel interview day' : 'Interview')}
        </h2>
        <p className="mt-1.5 text-body-sm text-ink-secondary">
          {interview.application?.title} — {interview.application?.team}
        </p>

        <div className="mt-3.5 flex flex-col gap-2 rounded-control bg-surface-page p-3.5">
          <Row icon={Calendar}>{fmtWeekdayShort(interview.startsAt, tz)}</Row>
          <Row icon={Clock}>
            {lead ? fmtRangeShort(lead.startsAt, lead.endsAt, tz) : fmtRangeShort(interview.startsAt, interview.endsAt, tz)}{' '}
            {fmtTime(interview.startsAt, tz).replace(/^.*\s/, '')} {zoneAbbr(interview.startsAt, tz)}
            {minutes ? ` · ${minutes} min` : ''}
          </Row>
          <Row icon={Video}>{interview.format === 'Video' ? 'Online · Google Meet' : interview.locationNote ?? interview.format}</Row>
        </div>

        {lead?.interviewers?.length > 0 && (
          <>
            <p className="mt-4 text-overline font-medium uppercase text-ink-muted">Interviewers</p>
            <ul className="mt-2.5 flex flex-col gap-2.5">
              {lead.interviewers.map((p) => (
                <li key={p.name} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-pill text-[11px] font-semibold text-ink-secondary">
                    {p.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-label-lg font-medium text-ink">{p.name}</span>
                    <span className="mt-0.5 block text-meta text-ink-muted">{p.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        <Button variant="primary" size="lg" fullWidth className="mt-4" onClick={() => navigate(`/interviews/${interview.slug}`)}>
          View interview details
        </Button>
        <Button variant="secondary" size="lg" fullWidth className="mt-2" onClick={() => dispatch(showToast('Added to your calendar'))}>
          Add to calendar
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          className="mt-1"
          onClick={() => dispatch(openModal({ modal: 'reschedule', payload: { interviewSlug: interview.slug } }))}
        >
          Request reschedule
        </Button>
      </div>
    </div>
  );
};

const Row = ({ icon: Icon, children }) => (
  <p className="flex items-center gap-2.5 text-body-sm text-ink">
    <Icon aria-hidden="true" size={15} strokeWidth={1.6} className="shrink-0 text-ink-muted" />
    {children}
  </p>
);

// Everything after the newest timeline entry is still ahead of the candidate.
const REMAINING = ['Hiring team review', 'Offer decision'];
const CLOSED = new Set(['Not Selected', 'Withdrawn', 'Hired']);

export const CurrentStageCard = ({ application, interview, tz }) => {
  const [showSessions, setShowSessions] = useState(true);
  if (!application) return null;

  // Timeline is newest-first from the API; the stepper reads oldest-first.
  const entries = [...(application.timeline ?? [])].reverse();
  const currentIndex = entries.length - 1;
  const upcoming = CLOSED.has(application.status) ? [] : REMAINING;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-card-title font-semibold text-ink">Current stage</h2>
        {application.reqRef && (
          <span className="shrink-0 font-mono text-meta-xs text-ink-muted">{application.reqRef}</span>
        )}
      </div>
      <p className="mt-1.5 text-body-sm text-ink-secondary">
        {application.title} — {application.team}
      </p>

      <ol className="mt-4 flex flex-col gap-3.5">
        {entries.map((e, i) => (
          <li key={`${e.at}-${e.title}`} className="flex gap-2.5">
            <StepDot state={i < currentIndex ? 'done' : 'current'} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className={cn('text-body-sm text-ink', i === currentIndex ? 'font-semibold' : 'font-medium')}>
                  {e.title}
                </span>
                {i === currentIndex && (
                  <span className="rounded-tag bg-accent-tint px-1.5 py-1 text-overline-sm font-medium uppercase text-accent-hover">
                    Current stage
                  </span>
                )}
              </p>
              <p className="mt-1 text-meta text-ink-muted">{fmtWeekdayShort(e.at, tz).replace(/^\w+, /, '')}</p>

              {i === currentIndex && interview?.sessions?.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSessions((v) => !v)}
                    className="mt-2 text-label-lg font-medium text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {showSessions ? 'Hide sessions' : 'Show sessions'}
                  </button>

                  {showSessions && (
                    <ul className="mt-2.5 flex flex-col gap-2.5 rounded-control border border-line-inner bg-surface-page p-3">
                      {interview.sessions.filter((s) => s.kind !== 'break').map((s, si) => (
                        <li key={`${s.startsAt}-${s.title}`} className="flex gap-2.5">
                          <StepDot state={si === 0 ? 'done' : si === 1 ? 'current' : 'future'} small />
                          <span className="min-w-0">
                            <span className="block text-meta-lg font-medium text-ink">{s.title}</span>
                            <span className="mt-0.5 block text-meta-xs text-ink-muted">
                              {fmtWeekdayShort(s.startsAt, tz).replace(/^\w+, /, '')} · {fmtRangeShort(s.startsAt, s.endsAt, tz)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </li>
        ))}

        {upcoming.map((label) => (
          <li key={label} className="flex gap-2.5">
            <StepDot state="future" />
            <span className="text-body-sm text-ink-secondary">{label}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
};

const StepDot = ({ state, small }) => {
  const size = small ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]';
  if (state === 'done') {
    return (
      <span className={cn('mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-success text-white', size)}>
        <Check aria-hidden="true" size={small ? 8 : 11} strokeWidth={3} />
      </span>
    );
  }
  if (state === 'current') {
    return (
      <span className={cn('mt-0.5 flex shrink-0 items-center justify-center rounded-full border-2 border-accent', size)}>
        <span className={cn('rounded-full bg-accent', small ? 'h-1 w-1' : 'h-1.5 w-1.5')} />
      </span>
    );
  }
  return <span className={cn('mt-0.5 shrink-0 rounded-full border-2 border-neutral-track', size)} />;
};
