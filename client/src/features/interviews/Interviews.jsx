import { Link } from 'react-router';
import { useDispatch } from 'react-redux';
import { Calendar } from 'lucide-react';

import {
  Button, Card, EmptyState, SkeletonCard, StatusPill, Tab, TabList, TabPanel, Tabs
} from '../../components/primitives/index.js';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { useFilterParams } from '../../lib/useFilterParams.js';
import { openModal, showToast } from '../../store/slices/ui.js';
import { useZone } from '../auth/queries.js';
import { useInterviews } from './queries.js';
import { fmtRange, fmtRangeShort, fmtWeekday } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export const Interviews = () => {
  const [{ tab }, update] = useFilterParams('interviews', ['tab']);

  return (
    <div className="mx-auto max-w-page-full">
      <PageHeader title="Interviews" />

      <Tabs value={tab} onValueChange={(v) => update({ tab: v })}>
        <TabList>
          <Tab value="upcoming">Upcoming</Tab>
          <Tab value="past">Past</Tab>
        </TabList>
        <TabPanel value="upcoming" className="pt-5"><InterviewList tab="upcoming" /></TabPanel>
        <TabPanel value="past" className="pt-5"><InterviewList tab="past" /></TabPanel>
      </Tabs>
    </div>
  );
};

const InterviewList = ({ tab }) => {
  const tz = useZone();
  const { data, isPending } = useInterviews(tab);

  if (isPending) return <div className="flex flex-col gap-3.5"><SkeletonCard lines={5} /></div>;

  if (!data.items.length) {
    return (
      <div className="rounded-card border border-line-card bg-surface-card">
        <EmptyState
          icon={Calendar}
          title={tab === 'upcoming' ? 'No interviews scheduled' : 'No past interviews'}
          body={
            tab === 'upcoming'
              ? 'When a hiring team schedules one, the full itinerary shows up here.'
              : 'Interviews you have completed will be listed here.'
          }
          action={<Link to="/applications"><Button variant="secondary" tabIndex={-1}>View my applications</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {data.items.map((i) => <InterviewCard key={i.slug} interview={i} tz={tz} past={tab === 'past'} />)}
    </div>
  );
};

// A panel day is ONE card, not one card per session. The prototype's toggle to
// split it apart was an exploration and is deliberately not built.
const InterviewCard = ({ interview: iv, tz, past }) => {
  const dispatch = useDispatch();
  const unlocksAt = new Date(iv.startsAt).getTime() - (iv.joinUnlockMinutesBefore ?? 15) * 60_000;
  const joinable = !past && Date.now() >= unlocksAt;

  return (
    <Card className={cn(past && 'bg-surface-sunken')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={cn('text-card-title font-semibold', past ? 'text-ink-secondary' : 'text-ink')}>
            {iv.kind === 'panel-day' ? 'Panel interview day' : iv.application?.title}
          </h2>
          <p className="mt-1.5 text-body-sm text-ink-secondary">{iv.application?.title} · {iv.application?.team}</p>
          <p className="mt-1.5 text-meta-lg text-ink-muted">
            {fmtWeekday(iv.startsAt, tz)} · {fmtRange(iv.startsAt, iv.endsAt, tz)}
          </p>
        </div>
        <StatusPill status={iv.status} tone={past ? 'neutral' : 'accent'} label={iv.status} />
      </div>

      <hr className="my-4 border-0 border-t border-line-inner" />

      <ol>
        {iv.sessions?.map((s) => (
          <li key={`${s.startsAt}-${s.title}`} className="flex flex-wrap gap-4 py-2.5">
            <span className="w-[118px] shrink-0 font-mono text-meta text-ink-muted">
              {fmtRangeShort(s.startsAt, s.endsAt, tz)}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('text-item font-semibold', s.kind === 'break' ? 'text-ink-muted' : 'text-ink')}>
                {s.title}
              </p>
              {s.kind !== 'break' && (
                <>
                  {s.interviewers?.length > 0 && (
                    <p className="mt-1 text-meta-lg text-ink-secondary">
                      {s.interviewers.map((p) => `${p.name} — ${p.role}`).join(' · ')}
                    </p>
                  )}
                  {s.focus && <p className="mt-1 text-meta-lg text-ink-muted">{s.focus}</p>}
                </>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {past ? (
          <p className="text-meta-lg text-ink-secondary">{iv.outcome ?? 'Completed.'}</p>
        ) : (
          <>
            {joinable && <Button variant="primary" size="md">Join interview</Button>}
            <Link to={`/interviews/${iv.slug}`}>
              <Button variant="secondary" size="md" tabIndex={-1}>View details</Button>
            </Link>
            <Button
              variant="ghost"
              size="md"
              onClick={() => dispatch(openModal({ modal: 'reschedule', payload: { interviewSlug: iv.slug } }))}
            >
              Request reschedule
            </Button>
            <Button variant="ghost" size="md" onClick={() => dispatch(showToast('Added to your calendar'))}>
              Add day to calendar
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
