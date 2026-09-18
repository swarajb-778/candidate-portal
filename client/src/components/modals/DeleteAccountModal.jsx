import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import { Button, Field, Modal, ModalClose } from '../primitives/index.js';
import { api, apiError } from '../../lib/api.js';
import { closeModal } from '../../store/slices/ui.js';

export const DeleteAccountModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState('');

  const remove = useMutation({
    mutationFn: () => api.delete('/me', { data: { confirmation } }),
    onSuccess: () => {
      dispatch(closeModal());
      navigate('/login', { replace: true });
    }
  });

  // The destructive button stays disabled until the word matches exactly.
  const armed = confirmation === 'DELETE';
  const error = remove.isError ? apiError(remove.error) : null;

  return (
    <Modal
      open
      onOpenChange={(v) => !v && dispatch(closeModal())}
      maxWidth="max-w-[472px]"
      title="Delete your account?"
      footer={
        <>
          <ModalClose asChild><Button variant="secondary" size="lg">Keep my account</Button></ModalClose>
          <Button
            variant="danger"
            size="lg"
            disabled={!armed}
            loading={remove.isPending}
            onClick={() => remove.mutate()}
          >
            Delete account
          </Button>
        </>
      }
    >
      <div className="rounded-button border border-danger-border bg-danger-bg p-3.5 text-body-sm text-danger-text">
        Open applications are withdrawn and scheduled interviews cancelled. Records we are required
        to retain for equal-opportunity reporting are anonymised. This cannot be undone.
      </div>

      <div className="mt-4">
        <Field
          label="Type DELETE to confirm"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          error={error?.message}
        />
      </div>
    </Modal>
  );
};
