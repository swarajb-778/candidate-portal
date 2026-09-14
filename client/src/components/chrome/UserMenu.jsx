import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '../../lib/cn.js';
import { useLogout } from '../../features/auth/queries.js';

const itemClass = cn(
  'flex cursor-pointer items-center rounded-menuitem px-2.5 py-2 text-body text-ink outline-none',
  'transition-[background-color] duration-control data-[highlighted]:bg-surface-hoverAlt'
);

// Initials and name come from the authenticated user — never a constant.
export const Avatar = ({ initials, className }) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-ink text-[11.5px] font-semibold text-white',
      className
    )}
  >
    {initials}
  </span>
);

export const UserMenu = ({ me }) => {
  const navigate = useNavigate();
  const logout = useLogout();

  const go = (to) => () => navigate(to);
  const signOut = () => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) });

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        className={cn(
          'flex h-ctl-lg items-center gap-2 rounded-full border border-line-card bg-surface-card pl-[5px] pr-2 app:pr-3',
          'transition-[background-color] duration-control hover:bg-surface-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
        )}
        aria-label={`Account menu for ${me.fullName}`}
      >
        <Avatar initials={me.initials} />
        <span className="hidden text-body-sm font-medium text-ink app:inline">{me.fullName}</span>
        <ChevronDown aria-hidden="true" size={15} strokeWidth={1.6} className="hidden text-ink-muted app:block" />
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[238px] rounded-menu border border-line-menu bg-surface-card p-1.5 shadow-menu"
        >
          <div className="px-2.5 pb-2.5 pt-1.5">
            <p className="truncate text-label-lg font-semibold text-ink">{me.fullName}</p>
            <p className="mt-1 truncate text-meta text-ink-muted">{me.email}</p>
          </div>
          <Dropdown.Item className={itemClass} onSelect={go('/profile')}>Profile</Dropdown.Item>
          <Dropdown.Item className={itemClass} onSelect={go('/settings')}>Settings</Dropdown.Item>
          <Dropdown.Item className={itemClass} onSelect={go('/help')}>Help</Dropdown.Item>
          <Dropdown.Separator className="my-1.5 h-px bg-line-inner" />
          <Dropdown.Item className={cn(itemClass, 'text-danger data-[highlighted]:bg-danger-bgAlt')} onSelect={signOut}>
            Sign out
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
