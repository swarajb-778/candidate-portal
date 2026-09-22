import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Field, Modal, ModalClose } from '../primitives/index.js';
import { closeModal, showToast } from '../../store/slices/ui.js';
import { declineOffer, useOffer, useOfferMutation } from '../../features/offer/queries.js';

export const DeclineOfferModal = () => {
  const dispatch = useDispatch();
  const slug = useSelector((s) => s.ui.modalPayload?.applicationSlug);
  const { data: offer } = useOffer(slug);
  const [reason, setReason] = useState('');

  const decline = useOfferMutation(slug, () => declineOffer(slug, reason));

  return (
    <Modal
      open
      onOpenChange={(v) => !v && dispatch(closeModal())}
      maxWidth="max-w-[472px]"
      title="Decline this offer?"
      footer={
        <>
          <ModalClose asChild><Button variant="secondary" size="lg">Keep reviewing</Button></ModalClose>
          <Button
            variant="danger"
            size="lg"
            loading={decline.isPending}
            onClick={async () => {
              await decline.mutateAsync();
              dispatch(showToast('Offer declined'));
              dispatch(closeModal());
            }}
          >
            Decline offer
          </Button>
        </>
      }
    >
      <p className="text-body text-ink-secondary">
        This closes the {offer?.title} application. Your profile stays active for other roles.
      </p>
      <div className="mt-4">
        <Field
          as="textarea"
          rows={3}
          label="Reason (optional)"
          placeholder="Helps the team improve — never shared with the hiring manager."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
};
