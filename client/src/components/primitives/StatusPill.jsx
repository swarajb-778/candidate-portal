import { cn } from '../../lib/cn.js';

// Status is never colour-only — the pill always carries its text.
const TONES = {
  neutral: 'bg-neutral-pill text-ink-slate',
  accent:  'bg-accent-tint text-accent-hover',
  success: 'bg-success-bg text-success'
};

const BY_STATUS = {
  'Draft':         'neutral',
  'Submitted':     'neutral',
  'Under Review':  'neutral',
  'Interview':     'accent',
  'Offer':         'success',
  'Hired':         'success',
  'Not Selected':  'neutral',
  'Withdrawn':     'neutral'
};

export const toneForStatus = (status) => BY_STATUS[status] ?? 'neutral';

// `label` overrides the text without changing the tone — Overview shows the
// stage ("PANEL INTERVIEW") rather than the status enum.
export const StatusPill = ({ status, label, tone, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-pill font-semibold uppercase',
      TONES[tone ?? toneForStatus(status)],
      className
    )}
  >
    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
    {label ?? status}
  </span>
);
