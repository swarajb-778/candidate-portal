import { Link } from 'react-router';
import { Button, Card } from '../../components/primitives/index.js';

export const NotFound = () => (
  <div className="mx-auto max-w-[560px]">
    <Card className="text-center">
      <h1 className="text-[22px] font-semibold leading-tight text-ink">We can’t find that page</h1>
      <p className="mt-2.5 text-body text-ink-secondary">
        The link may be out of date, or the page moved. Everything about your applications is still here.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Link to="/"><Button variant="primary" size="md" tabIndex={-1}>Back to Overview</Button></Link>
        <Link to="/help"><Button variant="secondary" size="md" tabIndex={-1}>Help &amp; FAQ</Button></Link>
      </div>

      <hr className="my-5 border-0 border-t border-line-inner" />

      <p className="text-meta-lg text-ink-muted">
        Signed out unexpectedly?{' '}
        <Link to="/session-expired" className="font-medium text-accent hover:text-accent-hover">
          See what happened
        </Link>
      </p>
    </Card>
  </div>
);
