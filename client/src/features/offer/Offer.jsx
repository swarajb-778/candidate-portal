import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Check, FileText } from 'lucide-react';

import { Button, Card, CardHeader, EmptyState, SkeletonCard } from '../../components/primitives/index.js';
import { BackLink, PageHeader } from '../../components/shared/PageHeader.jsx';
import { openModal } from '../../store/slices/ui.js';
import { useMe, useZone } from '../auth/queries.js';
import { proposeStartDate, useOffer, useOfferMutation } from './queries.js';
import { dotted, fileMeta, fmtCalendarDate, fmtDate, fmtTime, fmtWeekdayShort } from '../../lib/format.js';
import { zoneAbbr } from '../../lib/datetime.js';
import { cn } from '../../lib/cn.js';

export const Offer = () => {
  const { slug } = useParams();
  const tz = useZone();
  const { data: offer, isPending, isError } = useOffer(slug);

  if (isPending) return <SkeletonCard lines={8} className="mx-auto max-w-page-mid" />;
  if (isError) {
    return (
      <div className="mx-auto max-w-page-mid rounded-card border border-line-card bg-surface-card">
        <EmptyState
          title="No offer on this application"
          body="If an offer is extended, it will appear here and you'll be notified."
          action={<Link to={`/applications/${slug}`}><Button variant="primary" tabIndex={-1}>Back to the application</Button></Link>}
        />
      </div>
    );
  }

  const pending = offer.stage === 'review';

  return (
    <div className="mx-auto max-w-page-mid">
      <BackLink to="/applications">My Applications</BackLink>

      {/* The pill sits on its own line above the title — BackLink is inline, so
          this needs to be a block to clear it. */}
      <div className="mb-2.5">
        <span className="inline-block rounded-full bg-success-bg px-2.5 py-1.5 text-pill font-semibold uppercase text-success">
          Offer
        </span>
      </div>

      <PageHeader
        title={offer.title}
        sub={dotted(offer.team, offer.location)}
        actions={pending && <RespondByPanel respondByAt={offer.respondByAt} tz={tz} />}
      />

      {!pending && <ResolvedBanner offer={offer} tz={tz} />}

      <div className="flex flex-col gap-3.5">
        <SummaryCard offer={offer} slug={slug} />
        <StartDateCard offer={offer} slug={slug} tz={tz} pending={pending} />
        {pending && <DecisionCard slug={slug} />}
        <QuestionsCard />
      </div>
    </div>
  );
};

const RespondByPanel = ({ respondByAt, tz }) => (
  <div className="rounded-button border border-warning-border bg-warning-bgAlt px-3.5 py-2.5">
    <p className="text-overline font-medium uppercase text-warning">Respond by</p>
    <p className="mt-1.5 text-[13.5px] font-medium text-ink">{fmtWeekdayShort(respondByAt, tz)}</p>
  </div>
);

const ResolvedBanner = ({ offer, tz }) => {
  const { data: me } = useMe();

  if (offer.stage === 'declined') {
    return (
      <div className="mb-3.5 rounded-card border border-danger-border bg-danger-bg p-card">
        <h2 className="text-card-title font-semibold text-danger-heading">Offer declined</h2>
        <p className="mt-1.5 text-body-sm text-danger-text">
          Recruiting has been notified. This application is now closed, and your profile stays
          active for future roles.
        </p>
      </div>
    );
  }

  const start = offer.startDate?.confirmed ?? offer.startDate?.proposedByCompany;

  return (
    <div className="mb-3.5 flex gap-3.5 rounded-card border border-success-border bg-success-bgAlt p-card">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
        <Check aria-hidden="true" size={18} strokeWidth={2.4} />
      </span>
      <div className="min-w-0">
        <h2 className="text-card-title font-semibold text-ink">Offer accepted</h2>
        <p className="mt-1.5 text-body-sm text-success-text">
          Signed by {offer.signature?.typedName ?? me?.fullName} ·{' '}
          {fmtDate(offer.signature?.agreedAt, tz)} at {fmtTime(offer.signature?.agreedAt, tz)}{' '}
          {zoneAbbr(offer.signature?.agreedAt, tz)}. A countersigned copy is on the way to {me?.email}.
        </p>
        <p className="mt-2 text-body-sm text-success-text">
          Your onboarding contact will reach out within two business days about your{' '}
          {fmtCalendarDate(start)} start.
        </p>
      </div>
    </div>
  );
};

const SummaryCard = ({ offer, slug }) => {
  const dispatch = useDispatch();

  // Compensation lives in the letter, not on screen — deliberately absent here.
  const cells = [
    ['Title', offer.title],
    ['Team', offer.team],
    ['Employment type', offer.employmentType],
    ['Location', offer.location],
    ['Reports to', offer.reportsTo],
    ['Contingencies', offer.contingencies?.join(' · ')]
  ];

  return (
    <Card>
      <CardHeader title="Offer summary" />

      <div className="mt-4 grid gap-x-6 gap-y-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {cells.map(([label, value]) => (
          <div key={label}>
            <p className="text-overline font-medium uppercase text-ink-muted">{label}</p>
            <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-ink">{value || '—'}</p>
          </div>
        ))}
      </div>

      <hr className="my-4 border-0 border-t border-line-inner" />

      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-icon bg-neutral-pill text-ink-secondary">
          <FileText aria-hidden="true" size={18} strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-lg font-medium text-ink">{offer.letter?.name}</p>
          <p className="mt-1 text-meta text-ink-muted">
            Full written terms, including compensation · {fileMeta('application/pdf', offer.letter?.sizeBytes)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            dispatch(openModal({ modal: 'docPreview', payload: { url: `/api/v1/offers/${slug}/letter`, name: offer.letter?.name } }))
          }
        >
          Preview
        </Button>
      </div>
    </Card>
  );
};

const StartDateCard = ({ offer, slug, tz, pending }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  const propose = useOfferMutation(slug, (date) => proposeStartDate(slug, date));

  const company = offer.startDate?.proposedByCompany;
  const countered = offer.startDate?.proposedByCandidate;
  const shown = offer.startDate?.confirmed ?? countered ?? company;

  const submit = async () => {
    setError(null);
    try {
      await propose.mutateAsync(value);
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.error?.message ?? 'Could not propose that date.');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Start date"
        action={pending && !editing && (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Propose another date</Button>
        )}
      />

      {editing ? (
        <div className="mt-4">
          <input
            type="date"
            value={value}
            min={offer.startDateWindow?.min}
            max={offer.startDateWindow?.max}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Proposed start date"
            className="h-field w-full max-w-[240px] rounded-control border border-line-control bg-surface-card px-3 text-body text-ink transition-[border-color,box-shadow] duration-control focus:border-accent focus:shadow-focus focus:outline-none"
          />
          <p className="mt-2 text-meta-lg text-ink-muted">
            Recruiting confirms a proposed change before it becomes final. Onboarding cohorts start on Mondays.
          </p>
          {error && <p role="alert" className="mt-2 text-meta text-danger">{error}</p>}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="primary" size="md" disabled={!value} loading={propose.isPending} onClick={submit}>
              Propose this date
            </Button>
            <Button variant="secondary" size="md" onClick={() => { setEditing(false); setError(null); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3.5 text-value font-semibold text-ink">{fmtCalendarDate(shown)}</p>
          <p className="mt-2 text-body-sm text-ink-secondary">
            {countered && !offer.startDate?.confirmed
              ? `You proposed this date. Recruiting confirms within one business day — the original ${fmtCalendarDate(company)} date holds until then.`
              : 'The date the team has planned for you to start.'}
          </p>
        </>
      )}
    </Card>
  );
};

const DecisionCard = ({ slug }) => {
  const dispatch = useDispatch();

  return (
    <Card>
      <CardHeader title="Your decision" />
      <p className="mt-2.5 text-body-sm text-ink-secondary">
        Accepting opens a short signature step. Nothing is final until you sign.
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button
          variant="primary"
          size="lg"
          className="min-w-[180px]"
          onClick={() => dispatch(openModal({ modal: 'signature', payload: { applicationSlug: slug } }))}
        >
          Accept offer
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => dispatch(openModal({ modal: 'declineOffer', payload: { applicationSlug: slug } }))}
        >
          Decline
        </Button>
      </div>
    </Card>
  );
};

const QuestionsCard = () => (
  <Card>
    <CardHeader title="Questions before you decide?" />
    <p className="mt-2.5 text-body-sm text-ink-secondary">
      Your recruiter replies within one business day.
    </p>
    <Link to="/messages" className="mt-4 inline-block">
      <Button variant="secondary" size="md" tabIndex={-1}>Message recruiting</Button>
    </Link>
  </Card>
);
