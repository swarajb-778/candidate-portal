import { cn } from '../../lib/cn.js';

// Static by design. The spec allows four durations and one spinner, so a
// shimmering skeleton would be a fifth animation.
export const Skeleton = ({ className }) => (
  <span aria-hidden="true" className={cn('block rounded-control bg-neutral-bar', className)} />
);

// List screens get skeleton cards matching real row height, never a centered
// spinner that shifts the layout.
export const SkeletonCard = ({ lines = 3, className }) => (
  <div className={cn('rounded-card border border-line-card bg-surface-card p-card', className)}>
    <Skeleton className="h-[15px] w-1/3" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <Skeleton key={i} className={cn('mt-3 h-[13px]', i % 2 ? 'w-1/2' : 'w-3/4')} />
    ))}
  </div>
);
