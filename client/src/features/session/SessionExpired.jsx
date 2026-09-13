import { Link } from 'react-router';
import { Clock } from 'lucide-react';
import { Button } from '../../components/primitives/index.js';

// Reached by the Axios 401 interceptor, which stashes the pre-expiry pathname so
// this line is accurate and the post-login redirect lands there.
const PRETTY = {
  '/': 'Overview',
  '/applications': 'My Applications',
  '/interviews': 'Interviews',
  '/messages': 'Messages',
  '/documents': 'Documents',
  '/profile': 'your profile',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/help': 'Help & Candidate FAQ'
};

const describe = (path) => {
  if (!path) return 'your Overview';
  if (PRETTY[path]) return PRETTY[path];
  if (path.startsWith('/applications/') && path.endsWith('/offer')) return 'your offer';
  if (path.startsWith('/applications/')) return 'that application';
  if (path.startsWith('/interviews/')) return 'that interview';
  if (path.startsWith('/messages/')) return 'that conversation';
  return 'where you left off';
};

export const SessionExpired = () => {
  const last = sessionStorage.getItem('cp:lastLocation');

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page p-5">
      <div className="w-full max-w-[460px] rounded-modal border border-line-card bg-surface-card p-[clamp(26px,4vw,38px)] shadow-float">
        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-warning-bg text-warning">
          <Clock aria-hidden="true" size={22} strokeWidth={1.6} />
        </span>

        <h1 className="mt-5 text-[23px] font-semibold leading-tight tracking-[-0.016em] text-ink">
          Your session expired
        </h1>
        <p className="mt-2.5 text-body text-ink-secondary">
          You were signed out after 30 minutes of inactivity. Nothing was lost — drafts and
          uploads are saved to your account.
        </p>

        <p className="mt-4 rounded-control bg-surface-page px-3.5 py-3 text-body-sm text-ink-secondary">
          Signing back in returns you to {describe(last)}.
        </p>

        <Link to="/login" className="mt-5 block">
          <Button variant="primary" size="xl" fullWidth tabIndex={-1}>Sign in again</Button>
        </Link>

        <p className="mt-4 text-center text-meta-lg text-ink-muted">
          Trouble signing in?{' '}
          <Link to="/login?view=forgot" className="font-medium text-accent hover:text-accent-hover">
            Reset your password
          </Link>
        </p>
      </div>
    </div>
  );
};
