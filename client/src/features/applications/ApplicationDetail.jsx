import { Link, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Calendar, FileText } from 'lucide-react';

import {
  Button, Card, CardHeader, EmptyState, SkeletonCard, StatusPill,
  Tab, TabList, TabPanel, Tabs
} from '../../components/primitives/index.js';
import { BackLink, PageHeader } from '../../components/shared/PageHeader.jsx';
import { Timeline } from '../../components/shared/Timeline.jsx';
import { openModal, showToast } from '../../store/slices/ui.js';
import { useZone } from '../auth/queries.js';
import { useInterviews } from '../interviews/queries.js';
import { useApplication } from './queries.js';
import { dotted, fileMeta, fmtDate, fmtWeekday, fmtWeekdayShort } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const CLOSED = new Set(['Not Selected', 'Withdrawn']);

// One component for every application — the prototype's per-slug variants were
// scaffolding, not design intent.
export const ApplicationDetail = () => {
  const { slug } = useParams();
  const tz = useZone();
  const { data: a, isPending, isError } = useApplication(slug);
  const interviews = useInterviews('upcoming');

  if (isPending) return <SkeletonCard lines={6} className="mx-auto max-w-page-full" />;
  if (isError) {
    return (
      <div className="mx-auto max-w-page-wide rounded-card border border-line-card bg-surface-card">
        <EmptyState
          title="We can't find that application"
          body="The link may be out of date. Everything about your applications is still here."
          action={<Link to="/applications"><Button variant="primary" tabIndex={-1}>Back to My Applications</Button></Link>}
        />
      </div>
    );
  }

  const mine = interviews.data?.items?.filter((i) => i.application?.slug === slug) ?? [];

  return (
    <div className="mx-auto max-w-page-full">
      <BackLink to="/applications">My Applications</BackLink>

      <PageHeader
        title={a.title}
        sub={a.team}
        meta={dotted(a.location, a.employmentType)}
        pill={<StatusPill status={a.status} />}
      />

      <p className="-mt-3 mb-5 text-meta-lg text-ink-muted">
        <span className="font-mono text-[11.5px]">{a.reqRef}</span> · Applied {fmtDate(a.appliedAt, tz)}
      </p>

      <StatusBanner application={a} tz={tz} />

      <div className="mt-3.5 flex flex-wrap gap-[clamp(14px,1.8vw,22px)]">
        <div className="flex-[1_1_400px]">
          <Card className="p-0">
            <Tabs defaultValue="overview">
              <TabList className="px-2">
                <Tab value="overview">Overview</Tab>
                <Tab value="timeline">Timeline</Tab>
                <Tab value="documents">Documents</Tab>
                <Tab value="interviews">Interviews</Tab>
                <Tab value="notes">Notes</Tab>
              </TabList>

              <TabPanel value="overview" className="p-card">
                <h3 className="text-card-title font-semibold text-ink">About this role</h3>
                <p className="mt-2 text-body text-ink-secondary">
                  {a.title} on the {a.team} team, based in {a.location}. {a.employmentType}.
                </p>
                <h3 className="mt-5 text-card-title font-semibold text-ink">What happens next</h3>
                <p className="mt-2 text-body text-ink-secondary">
                  {a.timeline?.[0]?.text ?? 'Recruiting will be in touch with the next step.'}
                </p>
              </TabPanel>

              <TabPanel value="timeline" className="p-card">
                <Timeline entries={a.timeline} tz={tz} />
              </TabPanel>

              <TabPanel value="documents" className="p-card">
                {a.documents?.length ? (
                  <ul className="flex flex-col">
                    {a.documents.map((d) => (
                      <li key={d.slug} className="flex items-center gap-3 border-t border-line-list py-3 first:border-t-0">
                        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-icon bg-neutral-pill text-ink-secondary">
                          <FileText aria-hidden="true" size={16} strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-label-lg font-medium text-ink">{d.name}</p>
                          <p className="mt-1 text-meta-xs text-ink-muted">{fileMeta(d.mimeType, d.sizeBytes)}</p>
                        </div>
                        <Button variant="secondary" size="sm">View</Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No documents" body="Nothing was submitted with this application." />
                )}
              </TabPanel>

              <TabPanel value="interviews" className="p-card">
                {mine.length ? (
                  <ul className="flex flex-col">
                    {mine.map((i) => (
                      <li key={i.slug} className="flex flex-wrap items-center gap-3 border-t border-line-list py-3 first:border-t-0">
                        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-icon bg-accent-tint text-accent-hover">
                          <Calendar aria-hidden="true" size={16} strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-label-lg font-medium text-ink">
                            {i.kind === 'panel-day' ? 'Panel interview day' : 'Interview'}
                          </p>
                          <p className="mt-1 text-meta-xs text-ink-muted">{fmtWeekday(i.startsAt, tz)}</p>
                        </div>
                        <Link to={`/interviews/${i.slug}`}>
                          <Button variant="secondary" size="sm" tabIndex={-1}>View details</Button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    title="No interviews yet"
                    body="Nothing is scheduled on this application. Recruiting will reach out when there is."
                  />
                )}
              </TabPanel>

              <TabPanel value="notes" className="p-card">
                <EmptyState
                  title="No notes"
                  body="Notes the hiring team shares with you will appear here."
                />
              </TabPanel>
            </Tabs>
          </Card>
        </div>

        <div className="flex flex-[0_1_300px] flex-col gap-3.5">
          <ContactCard application={a} />
          <QuickActions application={a} />
        </div>
      </div>
    </div>
  );
};

const StatusBanner = ({ application: a, tz }) => {
  const closed = CLOSED.has(a.status);
  const offer = a.status === 'Offer';

  const tone = offer
    ? 'border-success-border bg-success-bgAlt'
    : closed
      ? 'border-line-card bg-surface-sunken'
      : 'border-accent-tintStrong bg-accent-tint';

  const heading = offer
    ? 'Offer extended'
    : closed
      ? a.status === 'Withdrawn' ? 'You withdrew this application' : 'Not selected'
      : 'Your application is in progress';

  const respondBy = a.offer?.respondByAt ? fmtWeekdayShort(a.offer.respondByAt, tz) : null;
  const body = offer
    ? `${respondBy ? `Respond by ${respondBy}. ` : ''}The written terms and start date are on the offer page.`
    : closed
      ? a.closeNote ?? 'This application is closed.'
      : a.timeline?.[0]?.text ?? 'Recruiting will be in touch with the next step.';

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4 rounded-card border p-card', tone)}>
      <div className="min-w-0">
        <h2 className={cn('text-card-title font-semibold', offer ? 'text-success' : 'text-ink')}>{heading}</h2>
        <p className={cn('mt-1.5 text-body-sm', offer ? 'text-success-text' : 'text-ink-secondary')}>{body}</p>
      </div>
      {offer && (
        <Link to={`/applications/${a.slug}/offer`}>
          <Button variant="primary" size="md" tabIndex={-1}>Review offer</Button>
        </Link>
      )}
    </div>
  );
};

const ContactCard = ({ application: a }) => {
  if (!a.recruiter?.name) return null;
  return (
    <Card>
      <CardHeader title="Your recruiter" />
      <div className="mt-3.5 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[12.5px] font-semibold text-accent-hover">
          {a.recruiter.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-label-lg font-medium text-ink">{a.recruiter.name}</p>
          <p className="mt-1 text-meta text-ink-muted">{a.recruiter.role}</p>
        </div>
      </div>
      <Link to="/messages" className="mt-4 block">
        <Button variant="secondary" size="md" fullWidth tabIndex={-1}>Send a message</Button>
      </Link>
    </Card>
  );
};

const QuickActions = ({ application: a }) => {
  const dispatch = useDispatch();
  const closed = CLOSED.has(a.status);

  return (
    <Card>
      <CardHeader title="Quick actions" />
      <div className="mt-3.5 flex flex-col gap-2">
        <Button variant="secondary" size="md" fullWidth onClick={() => dispatch(showToast('Opening the job description'))}>
          View job description
        </Button>
        <Button variant="secondary" size="md" fullWidth onClick={() => dispatch(showToast('Resume download started'))}>
          Download submitted resume
        </Button>
        {!closed && (
          <Button
            variant="ghost"
            size="md"
            fullWidth
            className="text-danger hover:bg-danger-bgAlt hover:text-danger-hover"
            onClick={() => dispatch(openModal({ modal: 'withdraw', payload: { applicationSlug: a.slug } }))}
          >
            Withdraw application
          </Button>
        )}
      </div>
    </Card>
  );
};
