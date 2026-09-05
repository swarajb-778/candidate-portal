import { createBrowserRouter } from 'react-router';

import { AppShell } from './components/chrome/AppShell.jsx';
import { RequireAuth } from './features/auth/RequireAuth.jsx';
import { LoginScreen } from './features/auth/LoginScreen.jsx';
import { SignupWizard } from './features/auth/SignupWizard.jsx';
import { SessionExpired } from './features/session/SessionExpired.jsx';
import { KitchenSink } from './features/kitchen-sink/KitchenSink.jsx';
import { Overview } from './features/overview/Overview.jsx';
import { Applications } from './features/applications/Applications.jsx';
import { ApplicationDetail } from './features/applications/ApplicationDetail.jsx';
import { Interviews } from './features/interviews/Interviews.jsx';
import { InterviewDetail } from './features/interviews/InterviewDetail.jsx';
import { Profile } from './features/profile/Profile.jsx';
import { Settings } from './features/settings/Settings.jsx';
import { Documents } from './features/documents/Documents.jsx';
import { Messages } from './features/messages/Messages.jsx';
import { Notifications } from './features/notifications/Notifications.jsx';
import { Offer } from './features/offer/Offer.jsx';
import { Help } from './features/help/Help.jsx';
import { NotFound } from './features/not-found/NotFound.jsx';

// Placeholder until each screen lands in its build step.
const Stub = ({ name }) => (
  <div className="rounded-card border border-line-card bg-surface-card p-card">
    <h1 className="text-page-title font-semibold text-ink">{name}</h1>
    <p className="mt-2 text-body-lg text-ink-secondary">Not built yet.</p>
  </div>
);

export const router = createBrowserRouter([
  { path: '/login',           element: <LoginScreen /> },
  { path: '/signup',          element: <SignupWizard /> },
  { path: '/session-expired', element: <SessionExpired /> },
  // Reference page for the primitives. Not part of the product.
  { path: '/_kitchen-sink',   element: <KitchenSink /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true,                       element: <Overview /> },
      { path: 'applications',              element: <Applications /> },
      { path: 'applications/:slug',        element: <ApplicationDetail /> },
      { path: 'applications/:slug/offer',  element: <Offer /> },
      { path: 'interviews',                element: <Interviews /> },
      { path: 'interviews/:slug',          element: <InterviewDetail /> },
      { path: 'messages',                  element: <Messages /> },
      { path: 'messages/:slug',            element: <Messages /> },
      { path: 'documents',                 element: <Documents /> },
      { path: 'profile',                   element: <Profile /> },
      { path: 'settings',                  element: <Settings /> },
      { path: 'notifications',             element: <Notifications /> },
      { path: 'help',                      element: <Help /> },
      { path: '*',                         element: <NotFound /> }
    ]
  }
]);
