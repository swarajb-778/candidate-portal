import { Outlet } from 'react-router';
import { Toast } from '../primitives/index.js';
import { ModalHost } from '../modals/ModalHost.jsx';
import { useMe, useNotifications, useThreads } from '../../features/auth/queries.js';
import { MobileTabBar } from './MobileTabBar.jsx';
import { NavDrawer } from './NavDrawer.jsx';
import { Sidebar } from './Sidebar.jsx';
import { useLogout } from '../../features/auth/queries.js';
import { TopBar } from './TopBar.jsx';

export const AppShell = () => {
  const { data: me } = useMe();
  const { data: notifications } = useNotifications();
  const { data: threads } = useThreads();

  const logout = useLogout();
  const messageCount = threads?.unreadCount ?? 0;

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Full-width bar; the sidebar starts below it. */}
      <TopBar me={me} unreadCount={notifications?.unreadCount ?? 0} />

      <Sidebar messageCount={messageCount} onLogout={() => logout.mutate()} />
      <NavDrawer messageCount={messageCount} />

      <div className="app:pl-[232px]">
        {/* pb keeps the mobile tab bar off the last card. */}
        <main className="px-4 pb-[82px] pt-card app:px-card app:pb-card">
          <Outlet />
        </main>
      </div>

      <MobileTabBar messageCount={messageCount} />
      <ModalHost />
      <Toast />
    </div>
  );
};
