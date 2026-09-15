import { cn } from '../../lib/cn.js';

// The five pipeline steps the design shows as a segmented bar.
export const STAGES = ['Applied', 'Review', 'Screen', 'Interview', 'Offer'];

// 1-based index of the stage an application is currently sitting in.
const CURRENT = {
  Draft: 1,
  Submitted: 1,
  'Under Review': 2,
  Interview: 4,
  Offer: 5,
  Hired: 5,
  'Not Selected': 0,
  Withdrawn: 0
};

const CLOSED = new Set(['Not Selected', 'Withdrawn']);

export const currentStage = (status) => CURRENT[status] ?? 0;

export const StageBar = ({ status, className }) => {
  const current = currentStage(status);
  const closed = CLOSED.has(status);

  return (
    <div className={cn('flex gap-1.5', className)} aria-hidden="true">
      {STAGES.map((_, i) => {
        const step = i + 1;
        return (
          <span
            key={step}
            className={cn(
              'h-[3px] flex-1 rounded-sm',
              closed ? 'bg-neutral-track'
                : step < current ? 'bg-success'
                : step === current ? 'bg-accent'
                : 'bg-line-card'
            )}
          />
        );
      })}
    </div>
  );
};
