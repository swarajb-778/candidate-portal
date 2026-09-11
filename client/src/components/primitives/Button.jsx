import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';
import { Spinner } from './Spinner.jsx';

const VARIANTS = {
  primary:
    'bg-accent text-white hover:bg-accent-hover disabled:bg-accent-disabled disabled:hover:bg-accent-disabled',
  secondary:
    'bg-surface-card text-ink border border-line-control hover:bg-surface-hover hover:border-line-controlHover disabled:text-ink-disabled disabled:hover:bg-surface-card disabled:hover:border-line-control',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-surface-hover hover:text-ink disabled:text-ink-disabled disabled:hover:bg-transparent',
  danger:
    'bg-danger text-white hover:bg-danger-hover disabled:bg-danger-disabled disabled:hover:bg-danger-disabled'
};

// Heights come from the control scale; the four button type specs map onto them.
const SIZES = {
  xs: { box: 'h-ctl-xs px-2.5', square: 'h-ctl-xs w-8', text: 'text-label-lg' },
  sm: { box: 'h-ctl px-3',      square: 'h-ctl w-9',         text: 'text-label-lg' },
  md: { box: 'h-ctl-lg px-3.5', square: 'h-ctl-lg w-10', text: 'text-body-sm' },
  lg: { box: 'h-tab px-4',      square: 'h-tab w-11',        text: 'text-body' },
  xl: { box: 'h-field-lg px-5', square: 'h-field-lg w-12', text: 'text-body-lg' }
};

const isHeavy = (variant) => variant === 'primary' || variant === 'danger';

export const Button = forwardRef(function Button(
  {
    variant = 'secondary',
    size = 'md',
    iconOnly = false,
    fullWidth = false,
    loading = false,
    disabled = false,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  const s = SIZES[size] ?? SIZES.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-button leading-none',
        'transition-[background-color,border-color,color] duration-control',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
        'disabled:cursor-not-allowed',
        isHeavy(variant) ? 'font-semibold' : 'font-medium',
        iconOnly ? s.square : s.box,
        s.text,
        VARIANTS[variant] ?? VARIANTS.secondary,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {/* The label is replaced, not hidden, so the button keeps its width. */}
      {loading ? <Spinner /> : children}
    </button>
  );
});
