import { cn } from '../../lib/cn.js';

// Cards carry no shadow — a 1px line-card border does the work.
export const Card = ({ as: Tag = 'section', className, children, ...rest }) => (
  <Tag
    className={cn('rounded-card border border-line-card bg-surface-card p-card', className)}
    {...rest}
  >
    {children}
  </Tag>
);

export const CardHeader = ({ title, action, className, children }) => (
  <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
    <div className="min-w-0">
      {title && <h2 className="text-card-title font-semibold text-ink">{title}</h2>}
      {children}
    </div>
    {action}
  </div>
);

export const CardDivider = ({ className }) => (
  <hr className={cn('border-0 border-t border-line-inner', className)} />
);
