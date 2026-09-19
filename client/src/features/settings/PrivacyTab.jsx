import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Button, Card, CardHeader, Spinner } from '../../components/primitives/index.js';
import { openModal } from '../../store/slices/ui.js';
import { fileSize } from '../../lib/format.js';
import { useExportJob, useSettingsMutation, requestExport } from './queries.js';

export const PrivacyTab = () => (
  <div className="flex flex-col gap-3.5">
    <ExportCard />
    <RetentionCard />
    <DeleteCard />
  </div>
);

const ExportCard = () => {
  const [jobId, setJobId] = useState(null);
  const start = useSettingsMutation(requestExport, { invalidate: [] });
  const job = useExportJob(jobId);

  const ready = job.data?.state === 'ready';
  const preparing = Boolean(jobId) && !ready;

  return (
    <Card>
      <CardHeader
        title="Download your data"
        action={
          !jobId && (
            <Button
              variant="secondary"
              size="sm"
              loading={start.isPending}
              onClick={async () => setJobId((await start.mutateAsync()).jobId)}
            >
              Request export
            </Button>
          )
        }
      />
      <p className="mt-3.5 text-body-sm text-ink-secondary">
        A copy of your profile, applications, interviews, messages and documents, as a single archive.
      </p>

      {preparing && (
        <p className="mt-3.5 flex items-center gap-2.5 text-body-sm text-ink-secondary">
          <Spinner className="text-ink-muted" />
          Preparing your file. This usually takes a minute.
        </p>
      )}

      {ready && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-button border border-success-border bg-success-bgAlt p-3.5">
          <div className="min-w-0">
            <p className="truncate text-label-lg font-medium text-ink">candidate-portal-export.zip</p>
            <p className="mt-1.5 text-meta text-success-text">
              {fileSize(job.data.sizeBytes)} · link expires in 7 days
            </p>
          </div>
          <a href={job.data.url}>
            <Button variant="primary" size="sm" tabIndex={-1}>Download</Button>
          </a>
        </div>
      )}
    </Card>
  );
};

const RetentionCard = () => (
  <Card>
    <CardHeader title="How long we keep your data" />
    <p className="mt-3.5 text-body-sm text-ink-secondary">
      Applications and interview records are kept for two years after a decision, as required for
      equal-opportunity reporting. Everything else is removed when you delete your account.
    </p>
    <p className="mt-3.5 text-body-sm">
      <a href="/help" className="text-accent hover:text-accent-hover">Privacy notice</a>
      <span className="px-2 text-ink-disabled">·</span>
      <a href="/help" className="text-accent hover:text-accent-hover">Candidate data FAQ</a>
    </p>
  </Card>
);

const DeleteCard = () => {
  const dispatch = useDispatch();

  return (
    <Card className="border-danger-border">
      <h2 className="text-card-title font-semibold text-danger-heading">Delete your account</h2>
      <p className="mt-2 text-body-sm text-ink-secondary">
        Open applications are withdrawn and scheduled interviews cancelled. Records we are required
        to retain are anonymised. This cannot be undone.
      </p>
      <Button
        variant="secondary"
        size="md"
        className="mt-4 border-danger-borderStrong text-danger hover:border-danger-borderStrong hover:bg-danger-bgAlt hover:text-danger-hover"
        onClick={() => dispatch(openModal({ modal: 'deleteAccount' }))}
      >
        Delete account
      </Button>
    </Card>
  );
};
