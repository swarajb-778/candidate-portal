import * as Accordion from '@radix-ui/react-accordion';
import { Link, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { ChevronDown, Download, FileText } from 'lucide-react';

import { Button, Card, CardHeader, EmptyState, SkeletonCard } from '../../components/primitives/index.js';
import { BackLink, PageHeader } from '../../components/shared/PageHeader.jsx';
import { showToast } from '../../store/slices/ui.js';
import { useZone } from '../auth/queries.js';
import { useInterview, usePrepToggle } from './queries.js';
import { fmtRange, fmtRangeShort, fmtWeekday } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export const InterviewDetail = () => {
  const { slug } = useParams();
  const tz = useZone();
  const { data: iv, isPending, isError } = useInterview(slug);

  if (isPending) return <SkeletonCard lines={6} className="mx-auto max-w-page-full" />;
  if (isError) {
    return (
      <div className="mx-auto max-w-page-wide rounded-card border border-line-card bg-surface-card">
        <EmptyState
          title="We can't find that interview"
          body="The link may be out of date."
          action={<Link to="/interviews"><Button variant="primary" tabIndex={-1}>Back to Interviews</Button></Link>}
        />
      </div>
    );
  }

  const sessions = iv.sessions ?? [];

  return (
    <div className="mx-auto max-w-page-full">
      <BackLink to="/interviews">Interviews</BackLink>

      <PageHeader
        title={iv.application?.title}
        sub={iv.kind === 'panel-day' ? 'Panel interview day' : 'Interview'}
        meta={`${fmtWeekday(iv.startsAt, tz)} · ${fmtRange(iv.startsAt, iv.endsAt, tz)}`}
      />

      <div className="flex flex-wrap gap-[clamp(14px,1.8vw,22px)]">
        <div className="flex-[1_1_400px]">
          <Card className="p-0">
            <div className="p-card pb-0">
              <CardHeader title="Itinerary" />
            </div>

            <Accordion.Root type="multiple" className="mt-3.5">
              {sessions.map((s) => (
                <Accordion.Item
                  key={`${s.startsAt}-${s.title}`}
                  value={`${s.startsAt}-${s.title}`}
                  className="border-t border-line-list"
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      disabled={s.kind === 'break'}
                      className={cn(
                        'group flex w-full items-center gap-4 px-card py-3.5 text-left',
                        'transition-[background-color] duration-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                        s.kind === 'break' ? 'cursor-default' : 'hover:bg-surface-hoverSoft'
                      )}
                    >
                      <span className="w-[118px] shrink-0 font-mono text-meta text-ink-muted">
                        {fmtRangeShort(s.startsAt, s.endsAt, tz)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-item font-semibold', s.kind === 'break' ? 'text-ink-muted' : 'text-ink')}>
                          {s.title}
                        </span>
                        {s.focus && <span className="mt-1 block text-meta-lg text-ink-muted">{s.focus}</span>}
                      </span>
                      {s.kind !== 'break' && (
                        <ChevronDown aria-hidden="true"
                          size={16}
                          strokeWidth={1.6}
                          className="shrink-0 text-ink-muted transition-transform duration-control group-data-[state=open]:rotate-180"
                        />
                      )}
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className="px-card pb-4 pl-[calc(theme(spacing.card)+118px+16px)]">
                    <ul className="flex flex-col gap-3">
                      {s.interviewers?.map((p) => (
                        <li key={p.name} className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11.5px] font-semibold text-accent-hover">
                            {p.initials}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-label-lg font-medium text-ink">{p.name}</span>
                            <span className="mt-1 block text-meta text-ink-muted">{p.role}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Card>
        </div>

        <div className="flex flex-[0_1_300px] flex-col gap-3.5">
          <JoinCard interview={iv} tz={tz} />
          <PrepCard interview={iv} />
          <ResourcesCard interview={iv} />
        </div>
      </div>
    </div>
  );
};

const JoinCard = ({ interview: iv }) => {
  const unlocksAt = new Date(iv.startsAt).getTime() - (iv.joinUnlockMinutesBefore ?? 15) * 60_000;
  const joinable = Date.now() >= unlocksAt;

  return (
    <Card>
      <CardHeader title="Join" />
      <p className="mt-2.5 text-body-sm text-ink-secondary">{iv.format}</p>

      {joinable ? (
        <Button variant="primary" size="md" fullWidth className="mt-3.5">Join interview</Button>
      ) : (
        <p className="mt-3.5 text-meta-lg text-ink-muted">
          The join link appears 15 minutes before your interview.
        </p>
      )}

      {iv.dialIn && (
        <>
          <hr className="my-3.5 border-0 border-t border-line-inner" />
          <p className="text-overline font-medium uppercase text-ink-muted">Dial-in</p>
          <p className="mt-1.5 font-mono text-meta-lg text-ink-secondary">{iv.dialIn}</p>
        </>
      )}
    </Card>
  );
};

const PrepCard = ({ interview: iv }) => {
  const toggle = usePrepToggle(iv.slug);
  const items = iv.prepChecklist ?? [];
  const done = items.filter((i) => i.done).length;

  return (
    <Card>
      <CardHeader title="Prep checklist" />
      <ul className="mt-3.5 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item._id}>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) => toggle.mutate({ itemId: item._id, done: e.target.checked })}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
              />
              <span className={cn('text-body-sm', item.done ? 'text-ink-muted line-through' : 'text-ink')}>
                {item.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 text-meta text-ink-muted">{done} of {items.length} done</p>
    </Card>
  );
};

const ResourcesCard = ({ interview: iv }) => {
  const dispatch = useDispatch();
  const items = iv.resources ?? [];
  if (!items.length) return null;

  return (
    <Card>
      <CardHeader title="Resources" />
      <ul className="mt-2">
        {items.map((r) => (
          <li key={r.label} className="flex items-center gap-3 border-t border-line-list py-3 first:border-t-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-icon bg-neutral-pill text-ink-secondary">
              <FileText aria-hidden="true" size={15} strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-lg font-medium text-ink">{r.label}</p>
              <p className="mt-1 text-meta text-ink-muted">{r.meta}</p>
            </div>
            <Button
              variant="ghost"
              iconOnly
              size="sm"
              aria-label={`Download ${r.label}`}
              onClick={() => dispatch(showToast(`${r.label} download started`))}
            >
              <Download aria-hidden="true" size={15} strokeWidth={1.6} />
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
