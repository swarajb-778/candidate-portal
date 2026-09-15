import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export const PageHeader = ({ title, sub, meta, actions, pill, className, titleClassName }) => (
  <header className={cn('mb-5 flex flex-wrap items-start justify-between gap-4', className)}>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={cn('text-page-title font-semibold text-ink', titleClassName)}>{title}</h1>
        {pill}
      </div>
      {sub && <p className="mt-2 text-body-lg text-ink-secondary">{sub}</p>}
      {meta && <p className="mt-2 text-meta-lg text-ink-muted">{meta}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
  </header>
);

export const BackLink = ({ to, children }) => (
  <Link
    to={to}
    className="mb-3.5 -ml-2 inline-flex h-ctl items-center gap-1 rounded-control px-2 text-body-sm font-medium text-ink-secondary transition-[background-color,color] duration-control hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    <ChevronLeft aria-hidden="true" size={15} strokeWidth={1.6} />
    {children}
  </Link>
);
