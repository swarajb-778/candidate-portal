import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn.js';

// 42px form field, 48px on the auth screens. No @tailwindcss/forms — it fights
// this exact height / radius / border treatment.
const SIZES = {
  md: 'h-field rounded-control text-body',
  lg: 'h-field-lg rounded-button text-body-lg'
};

const shell = (invalid) =>
  cn(
    'w-full border bg-surface-card px-3 text-ink placeholder:text-ink-muted',
    'transition-[border-color,box-shadow] duration-control',
    'focus:outline-none focus:shadow-focus',
    invalid
      ? 'border-danger focus:border-danger focus:shadow-focus-danger'
      : 'border-line-control focus:border-accent',
    'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-disabled'
  );

export const Field = forwardRef(function Field(
  { label, labelAction, hint, error, size = 'md', as = 'input', rows = 4, id, className, ...rest },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const invalid = Boolean(error);

  const control =
    as === 'textarea' ? (
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={hint || error ? hintId : undefined}
        className={cn(shell(invalid), 'h-auto rounded-control py-2.5 text-body leading-normal', !invalid && 'border-line-input', className)}
        {...rest}
      />
    ) : (
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={invalid || undefined}
        aria-describedby={hint || error ? hintId : undefined}
        className={cn(shell(invalid), SIZES[size] ?? SIZES.md, className)}
        {...rest}
      />
    );

  return (
    <div className="w-full">
      {(label || labelAction) && (
        <div className="mb-[7px] flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={fieldId} className="text-label-lg font-medium text-ink-chip">
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}
      {control}
      {error ? (
        <p id={hintId} role="alert" className="mt-1.5 text-meta text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-meta text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
