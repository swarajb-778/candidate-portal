import { cn } from '../../lib/cn.js';

// Heading, one explanatory line, a single action. Nothing else.
export const EmptyState = ({ icon: Icon, title, body, action, className }) => (
  <div className={cn('flex flex-col items-center px-card py-10 text-center', className)}>
    {Icon && (
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-pill text-ink-muted">
        <Icon aria-hidden="true" size={20} strokeWidth={1.6} />
      </span>
    )}
    <h2 className="text-[16px] font-semibold leading-tight text-ink">{title}</h2>
    {body && <p className="mt-2 max-w-[46ch] text-body text-ink-secondary">{body}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
