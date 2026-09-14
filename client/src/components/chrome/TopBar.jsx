import { Menu } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Button } from '../primitives/index.js';
import { cn } from '../../lib/cn.js';
import { setDrawerOpen } from '../../store/slices/ui.js';
import { NotifBell } from './NotifBell.jsx';
import { UserMenu } from './UserMenu.jsx';

// The brand mark is live type, not a logo file.
// `full` keeps both halves — the drawer has room where the mobile bar doesn't.
export const Wordmark = ({ full = false }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="whitespace-nowrap text-[12px] font-semibold uppercase leading-none tracking-[0.04em] text-ink">
      Rivian &amp; VW Tech
    </span>
    {/* Below `app:` there is no room beside the hamburger, bell and avatar —
        the secondary label drops rather than truncating mid-word. */}
    <span aria-hidden="true" className={cn('h-4 w-px shrink-0 bg-line-card', full ? 'block' : 'hidden app:block')} />
    <span className={cn('whitespace-nowrap text-body text-ink-secondary', full ? 'inline' : 'hidden app:inline')}>
      Candidate Portal
    </span>
  </div>
);

export const TopBar = ({ me, unreadCount }) => {
  const dispatch = useDispatch();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line-card bg-surface-card px-4 app:px-card">
      <Button
        variant="ghost"
        iconOnly
        size="md"
        aria-label="Open navigation"
        className="app:hidden"
        onClick={() => dispatch(setDrawerOpen(true))}
      >
        <Menu aria-hidden="true" size={18} strokeWidth={1.6} />
      </Button>

      <Wordmark />

      <div className="ml-auto flex items-center gap-2">
        <NotifBell unreadCount={unreadCount} />
        <UserMenu me={me} />
      </div>
    </header>
  );
};
