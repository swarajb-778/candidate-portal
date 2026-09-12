import { Navigate, useLocation } from 'react-router';
import { useMe } from './queries.js';

// Boot probe. A 401 here means "never signed in", which is a redirect to
// /login — distinct from a session dying mid-use, which the Axios interceptor
// routes to /session-expired.
export const RequireAuth = ({ children }) => {
  const { data: me, isPending, isError } = useMe();
  const location = useLocation();

  if (isPending) return <BootSplash />;
  if (isError || !me) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
};

const BootSplash = () => (
  <div className="min-h-screen bg-surface-page" aria-busy="true" aria-label="Loading" />
);
