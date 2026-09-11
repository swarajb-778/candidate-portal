import * as RTabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn.js';

export const Tabs = RTabs.Root;
export const TabPanel = RTabs.Content;

export const TabList = ({ className, children, ...rest }) => (
  <RTabs.List
    className={cn('flex items-stretch gap-1 border-b border-line-card', className)}
    {...rest}
  >
    {children}
  </RTabs.List>
);

export const Tab = ({ className, children, ...rest }) => (
  <RTabs.Trigger
    className={cn(
      'relative h-tab px-[14px] text-body font-normal text-ink-slate',
      'transition-[color] duration-control hover:text-ink',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
      // 2px accent underline sits on the list's own 1px border, so it reads as
      // a replacement rather than a second line.
      'data-[state=active]:font-semibold data-[state=active]:text-ink',
      'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-transparent',
      'data-[state=active]:after:bg-accent',
      className
    )}
    {...rest}
  >
    {children}
  </RTabs.Trigger>
);
