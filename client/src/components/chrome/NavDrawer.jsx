import * as Dialog from '@radix-ui/react-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { setDrawerOpen } from '../../store/slices/ui.js';
import { NavItems, SidebarFooter } from './Sidebar.jsx';
import { Wordmark } from './TopBar.jsx';

// Below `app:` the sidebar becomes a left drawer over a scrim. It closes on
// navigation and on overlay tap.
export const NavDrawer = ({ messageCount }) => {
  const open = useSelector((s) => s.ui.drawerOpen);
  const dispatch = useDispatch();
  const close = () => dispatch(setDrawerOpen(false));

  return (
    <Dialog.Root open={open} onOpenChange={(v) => dispatch(setDrawerOpen(v))}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim app:hidden" />
        <Dialog.Content
          aria-label="Navigation"
          className="fixed inset-y-0 left-0 z-50 flex w-[268px] max-w-[82vw] flex-col overflow-y-auto bg-surface-card px-3.5 pb-5 pt-5 focus:outline-none app:hidden"
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="mb-5 pr-2">
            <Wordmark full />
          </div>
          <NavItems messageCount={messageCount} onNavigate={close} />
          <div className="mt-auto">
            <SidebarFooter onNavigate={close} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
