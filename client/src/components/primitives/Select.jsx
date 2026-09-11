import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../../lib/cn.js';

// Radix Select so keyboard and roles are right; the trigger matches Field.
export const Select = ({
  label,
  hint,
  error,
  value,
  onValueChange,
  options = [],
  placeholder = 'Select…',
  disabled,
  className,
  triggerClassName,
  ...rest
}) => {
  const id = useId();
  const invalid = Boolean(error);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-[7px] block text-label-lg font-medium text-ink-chip">
          {label}
        </label>
      )}

      <RSelect.Root value={value} onValueChange={onValueChange} disabled={disabled} {...rest}>
        <RSelect.Trigger
          id={id}
          aria-invalid={invalid || undefined}
          className={cn(
            'flex h-field w-full items-center justify-between gap-2 rounded-control border bg-surface-card px-3 text-body text-ink',
            'transition-[border-color,box-shadow] duration-control',
            'focus:outline-none focus:shadow-focus data-[placeholder]:text-ink-muted',
            invalid ? 'border-danger focus:border-danger' : 'border-line-control focus:border-accent',
            'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-disabled',
            triggerClassName
          )}
        >
          <RSelect.Value placeholder={placeholder} />
          <RSelect.Icon>
            <ChevronDown aria-hidden="true" size={16} strokeWidth={1.6} className="text-ink-muted" />
          </RSelect.Icon>
        </RSelect.Trigger>

        <RSelect.Portal>
          <RSelect.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-menu border border-line-menu bg-surface-card shadow-menu"
          >
            <RSelect.Viewport className="p-1.5">
              {options.map((o) => {
                const val = typeof o === 'string' ? o : o.value;
                const text = typeof o === 'string' ? o : o.label;
                return (
                  <RSelect.Item
                    key={val}
                    value={val}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-3 rounded-menuitem px-2.5 py-2 text-body text-ink',
                      'outline-none transition-[background-color] duration-control',
                      'data-[highlighted]:bg-surface-hoverAlt data-[state=checked]:text-accent-hover'
                    )}
                  >
                    <RSelect.ItemText>{text}</RSelect.ItemText>
                    <RSelect.ItemIndicator>
                      <Check aria-hidden="true" size={15} strokeWidth={1.6} />
                    </RSelect.ItemIndicator>
                  </RSelect.Item>
                );
              })}
            </RSelect.Viewport>
          </RSelect.Content>
        </RSelect.Portal>
      </RSelect.Root>

      {error ? (
        <p role="alert" className="mt-1.5 text-meta text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-meta text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
};
