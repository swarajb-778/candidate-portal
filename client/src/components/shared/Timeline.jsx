import { cn } from '../../lib/cn.js';
import { fmtDayShort } from '../../lib/format.js';

const DOT = { success: 'bg-success', active: 'bg-accent', neutral: 'bg-neutral-dot' };

// A 9px dot riding a 1px rail, beside the date in mono and the entry copy.
export const Timeline = ({ entries = [], tz, className }) => (
  <ol className={cn('relative', className)}>
    {entries.map((e, i) => (
      <li key={`${e.at}-${e.title}`} className="relative flex gap-3.5 pb-5 last:pb-0">
        <div className="relative flex w-[9px] shrink-0 justify-center">
          <span className={cn('z-10 mt-[5px] h-[9px] w-[9px] rounded-full', DOT[e.tone] ?? DOT.neutral)} />
          {i < entries.length - 1 && (
            <span aria-hidden="true" className="absolute left-1/2 top-[5px] h-full w-px -translate-x-1/2 bg-line-card" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-timeline-date font-medium uppercase text-ink-muted">
            {fmtDayShort(e.at, tz)}
          </p>
          <p className="mt-1.5 text-item font-semibold text-ink">{e.title}</p>
          {e.text && <p className="mt-1 text-body-sm text-ink-secondary">{e.text}</p>}
        </div>
      </li>
    ))}
  </ol>
);
