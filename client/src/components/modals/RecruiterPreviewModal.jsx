import { useDispatch } from 'react-redux';

import { Button, Modal, ModalClose, Skeleton } from '../primitives/index.js';
import { closeModal } from '../../store/slices/ui.js';
import { useRecruiterView } from '../../features/profile/queries.js';
import { dotted } from '../../lib/format.js';

const Row = ({ label, value }) => (
  <div>
    <p className="text-overline font-medium uppercase text-ink-muted">{label}</p>
    <p className="mt-1.5 text-[13.5px] font-medium text-ink">{value || '—'}</p>
  </div>
);

// Rendered entirely from GET /me/profile/recruiter-view, so the footnote's
// promise is enforced by the endpoint rather than by hiding fields here.
export const RecruiterPreviewModal = () => {
  const dispatch = useDispatch();
  const { data, isPending } = useRecruiterView(true);

  return (
    <Modal
      open
      onOpenChange={(v) => !v && dispatch(closeModal())}
      maxWidth="max-w-[560px]"
      showClose
      title="Recruiter view"
      description="What the hiring team sees on your applications."
      footer={<ModalClose asChild><Button variant="secondary" size="lg">Close</Button></ModalClose>}
    >
      {isPending ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-24 w-full" /></div>
      ) : (
        <>
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-[16px] font-semibold text-white">
              {data.initials}
            </span>
            <div className="min-w-0">
              <p className="text-value-lg font-semibold text-ink">{data.fullName}</p>
              <p className="mt-1 text-body text-ink-secondary">
                {dotted(data.preferences?.targetRole, data.city)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Row label="Email" value={data.email} />
            <Row label="Phone" value={data.phone} />
            <Row label="Location" value={data.city} />
            <Row label="Work authorization" value={data.workAuth} />
          </div>

          <h3 className="mt-6 text-card-title font-semibold text-ink">Experience</h3>
          <ul className="mt-2.5">
            {data.experience?.map((e) => (
              <li key={e._id ?? e.title} className="border-t border-line-list py-3 first:border-t-0">
                <p className="text-item font-semibold text-ink">{e.title}</p>
                <p className="mt-1 text-body-sm text-ink-secondary">{dotted(e.org, e.period, e.loc)}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-5 text-card-title font-semibold text-ink">Skills</h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {data.skills?.map((s) => (
              <span key={s} className="rounded-full border border-line-chip bg-surface-page px-3 py-1.5 text-label-lg font-medium text-ink-chip">
                {s}
              </span>
            ))}
          </div>

          <p className="mt-6 rounded-control bg-surface-page p-3.5 text-meta-lg text-ink-muted">
            Self-identification answers and compensation expectations are never included in this view.
          </p>
        </>
      )}
    </Modal>
  );
};
