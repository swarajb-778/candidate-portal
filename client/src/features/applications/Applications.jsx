import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Link } from 'react-router';
import { useDispatch } from 'react-redux';
import { ChevronDown, FileText, MoreVertical } from 'lucide-react';

import { Button, EmptyState, SkeletonCard, StatusPill } from '../../components/primitives/index.js';
import { FilterChips } from '../../components/shared/FilterChips.jsx';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { useFilterParams } from '../../lib/useFilterParams.js';
import { openModal, showToast } from '../../store/slices/ui.js';
import { useZone } from '../auth/queries.js';
import { useApplications } from './queries.js';
import { dotted, fmtDate } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const CHIPS = [
  { value: 'all',       label: 'All' },
  { value: 'active',    label: 'Active' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer',     label: 'Offer' },
  { value: 'closed',    label: 'Closed' }
];

const SORTS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title',  label: 'Role A–Z' }
];

const CLOSED = new Set(['Not Selected', 'Withdrawn']);

export const Applications = () => {
  const dispatch = useDispatch();
  const tz = useZone();
  // Mirrored into the URL so a filtered list is shareable and survives reload.
  const [filters, update] = useFilterParams('applications', ['status', 'sort']);

  const { data, isPending } = useApplications(filters);
  const count = data?.counts?.all ?? 0;

  return (
    <div className="mx-auto max-w-page-full">
      <PageHeader
        title="My Applications"
        sub={isPending ? ' ' : `${count} application${count === 1 ? '' : 's'}`}
        actions={<SortMenu value={filters.sort} onChange={(sort) => update({ sort })} />}
      />

      <FilterChips
        options={CHIPS}
        value={filters.status}
        onChange={(status) => update({ status })}
        counts={data?.counts}
        className="mb-5"
      />

      {isPending ? (
        <div className="flex flex-col gap-3.5">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-card border border-line-card bg-surface-card">
          {/* Having none at all is a different state from none under a filter. */}
          {data.counts.all === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              body="When you apply to a role, it appears here with its status and full timeline."
              action={<Link to="/profile"><Button variant="secondary" tabIndex={-1}>Complete your profile</Button></Link>}
            />
          ) : (
            <EmptyState
              title="Nothing here yet"
              body="No applications match this filter. Try another one, or view them all."
              action={<Button variant="secondary" onClick={() => update({ status: 'all' })}>Show all applications</Button>}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {data.items.map((a) => <Row key={a.slug} application={a} tz={tz} />)}
        </div>
      )}
    </div>
  );
};

const SortMenu = ({ value, onChange }) => (
  <Dropdown.Root>
    <Dropdown.Trigger asChild>
      <Button variant="secondary" size="md">
        Sort: {SORTS.find((s) => s.value === value)?.label}
        <ChevronDown aria-hidden="true" size={15} strokeWidth={1.6} className="text-ink-muted" />
      </Button>
    </Dropdown.Trigger>
    <Dropdown.Portal>
      <Dropdown.Content
        align="end"
        sideOffset={6}
        className="z-50 w-[190px] rounded-menu border border-line-menu bg-surface-card p-1.5 shadow-menu"
      >
        {SORTS.map((s) => (
          <Dropdown.Item
            key={s.value}
            onSelect={() => onChange(s.value)}
            className={cn(
              'cursor-pointer rounded-menuitem px-2.5 py-2 text-body outline-none',
              'transition-[background-color] duration-control data-[highlighted]:bg-surface-hoverAlt',
              s.value === value ? 'font-medium text-accent-hover' : 'text-ink'
            )}
          >
            {s.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Portal>
  </Dropdown.Root>
);

// Withdrawn and Not Selected rows stay in the list — greyed, with the outcome
// explained and the actions reduced.
const Row = ({ application: a, tz }) => {
  const dispatch = useDispatch();
  const closed = CLOSED.has(a.status);

  const statusLine = closed
    ? a.closeNote ?? `Closed ${fmtDate(a.closedAt, tz)}`
    : a.timeline?.[0]?.text ?? a.timeline?.[0]?.title ?? '';

  return (
    <article className="rounded-card border border-line-card bg-surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={cn('text-item font-semibold', closed ? 'text-ink-muted' : 'text-ink')}>{a.title}</h2>
          <p className={cn('mt-1.5 text-meta', closed ? 'text-ink-muted' : 'text-ink-secondary')}>
            {dotted(a.team, a.location, `Applied ${fmtDate(a.appliedAt, tz)}`)}
          </p>
        </div>
        <StatusPill status={a.status} label={a.stageLabel} />
      </div>

      <hr className="my-4 border-0 border-t border-line-list" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="min-w-[200px] flex-1 text-meta-lg text-ink-secondary">{statusLine}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/applications/${a.slug}`}>
            <Button variant="secondary" size="md" tabIndex={-1}>View application →</Button>
          </Link>

          {a.status === 'Offer' && (
            <Link to={`/applications/${a.slug}/offer`}>
              <Button variant="primary" size="md" tabIndex={-1}>Review offer</Button>
            </Link>
          )}

          {!closed && <RowMenu application={a} dispatch={dispatch} />}
        </div>
      </div>
    </article>
  );
};

const RowMenu = ({ application, dispatch }) => (
  <Dropdown.Root>
    <Dropdown.Trigger asChild>
      <Button variant="secondary" iconOnly size="sm" aria-label={`Actions for ${application.title}`} className="rounded-control">
        <MoreVertical aria-hidden="true" size={16} strokeWidth={1.6} />
      </Button>
    </Dropdown.Trigger>
    <Dropdown.Portal>
      <Dropdown.Content
        align="end"
        sideOffset={6}
        className="z-50 w-[232px] rounded-menu border border-line-menu bg-surface-card p-1.5 shadow-menu"
      >
        <Dropdown.Item
          className="cursor-pointer rounded-menuitem px-2.5 py-2 text-body text-ink outline-none transition-[background-color] duration-control data-[highlighted]:bg-surface-hoverAlt"
          onSelect={() => dispatch(showToast('Opening the job description'))}
        >
          View job description
        </Dropdown.Item>
        <Dropdown.Item
          className="cursor-pointer rounded-menuitem px-2.5 py-2 text-body text-ink outline-none transition-[background-color] duration-control data-[highlighted]:bg-surface-hoverAlt"
          onSelect={() => dispatch(showToast('Resume download started'))}
        >
          Download submitted resume
        </Dropdown.Item>
        <Dropdown.Separator className="my-1.5 h-px bg-line-inner" />
        <Dropdown.Item
          className="cursor-pointer rounded-menuitem px-2.5 py-2 text-body text-danger outline-none transition-[background-color] duration-control data-[highlighted]:bg-danger-bgAlt"
          onSelect={() => dispatch(openModal({ modal: 'withdraw', payload: { applicationSlug: application.slug } }))}
        >
          Withdraw application
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Portal>
  </Dropdown.Root>
);
