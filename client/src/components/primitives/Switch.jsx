import * as RSwitch from '@radix-ui/react-switch';
import { cn } from '../../lib/cn.js';

// 42×24 track, 18px knob inset 3px — so it sits at left:3px off and left:21px on.
const TRACK = 'relative h-6 w-[42px] shrink-0 rounded-full transition-[background-color] duration-toggle';
const KNOB = 'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-surface-card shadow-knob transition-[left] duration-toggle';

export const Switch = ({ checked, onCheckedChange, disabled, label, className, ...rest }) => (
  <RSwitch.Root
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    aria-label={label}
    className={cn(
      TRACK,
      checked ? 'bg-accent' : 'bg-neutral-track',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
      disabled && 'cursor-not-allowed opacity-60',
      className
    )}
    {...rest}
  >
    <RSwitch.Thumb className={cn(KNOB, checked ? 'left-[21px]' : 'left-[3px]')} />
  </RSwitch.Root>
);

// Interview invitations by email can never be turned off. It is not a button at
// all — no role, no handler, nothing for a keyboard to land on.
export const LockedSwitch = ({ className }) => (
  <span title="Always on" className={cn(TRACK, 'block bg-accent-locked', className)}>
    <span className={cn(KNOB, 'left-[21px]')} />
  </span>
);
