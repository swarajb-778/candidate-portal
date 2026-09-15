import { cn } from '../../lib/cn.js';

// Active chip is solid ink; inactive is a bordered card. Counts append as "· 3".
export const FilterChips = ({ options, value, onChange, counts, className }) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {options.map((o) => {
      const active = o.value === value;
      const count = counts?.[o.value];
      return (
        <button
          key={o.value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex h-ctl items-center rounded-full border px-3.5 text-label-lg font-medium',
            'transition-[background-color,border-color,color] duration-control',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            active
              ? 'border-ink bg-ink text-white'
              : 'border-line-control bg-surface-card text-ink-secondary hover:border-line-controlHover hover:text-ink'
          )}
        >
          {o.label}
          {count != null && <span className={cn('ml-1', active ? 'text-white/70' : 'text-ink-muted')}>· {count}</span>}
        </button>
      );
    })}
  </div>
);
