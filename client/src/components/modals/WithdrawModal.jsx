import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Modal, ModalClose } from '../primitives/index.js';
import { api, apiError } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';
import { closeModal, showToast } from '../../store/slices/ui.js';
import { useApplication } from '../../features/applications/queries.js';

export const WithdrawModal = () => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const slug = useSelector((s) => s.ui.modalPayload?.applicationSlug);
  const { data: application } = useApplication(slug);

  const withdraw = useMutation({
    mutationFn: () => api.post(`/applications/${slug}/withdraw`),
    onSuccess: () => {
      // Withdrawing touches the list, the row, any interview on it, and the
      // notification feed.
      [qk.applications(), qk.application(slug), qk.interviews('upcoming'),
       qk.interviews('past'), qk.notifications()].forEach((key) =>
        qc.invalidateQueries({ queryKey: key.slice(0, 1) })
      );
      dispatch(showToast('Application withdrawn'));
      dispatch(closeModal());
    }
  });

  const error = withdraw.isError ? apiError(withdraw.error) : null;

  return (
    <Modal
      open
      onOpenChange={(v) => !v && dispatch(closeModal())}
      maxWidth="max-w-[472px]"
      title="Withdraw this application?"
      footer={
        <>
          <ModalClose asChild>
            <Button variant="secondary" size="lg">Keep application</Button>
          </ModalClose>
          <Button variant="danger" size="lg" loading={withdraw.isPending} onClick={() => withdraw.mutate()}>
            Withdraw application
          </Button>
        </>
      }
    >
      <p className="text-body font-medium text-ink">{application?.title}</p>
      <p className="mt-1 text-meta text-ink-muted">{application?.team}</p>

      <div className="mt-3.5 rounded-button border border-danger-border bg-danger-bg p-3.5 text-body-sm text-danger-text">
        This can’t be undone. Recruiting will be notified, any scheduled interviews will be
        cancelled, and you’ll need to reapply if you change your mind.
      </div>

      {error && (
        <p role="alert" className="mt-3 text-body-sm text-danger">{error.message}</p>
      )}
    </Modal>
  );
};
