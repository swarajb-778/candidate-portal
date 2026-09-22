import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { signatureSchema } from '@candidate-portal/shared/schemas/offer';

import { Button, Modal, ModalClose } from '../primitives/index.js';
import { closeModal, showToast } from '../../store/slices/ui.js';
import { useMe, useZone } from '../../features/auth/queries.js';
import { acceptOffer, useOffer, useOfferMutation } from '../../features/offer/queries.js';
import { dotted, fmtCalendarDate } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export const SignatureModal = () => {
  const dispatch = useDispatch();
  const tz = useZone();
  const slug = useSelector((s) => s.ui.modalPayload?.applicationSlug);
  const { data: me } = useMe();
  const { data: offer } = useOffer(slug);

  const fullName = me?.fullName ?? '';
  const accept = useOfferMutation(slug, (body) => acceptOffer(slug, body));

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(signatureSchema(fullName)),
    defaultValues: { typedName: '', agreed: false }
  });

  const submit = handleSubmit(async (values) => {
    try {
      await accept.mutateAsync(values);
      dispatch(showToast('Offer accepted'));
      dispatch(closeModal());
    } catch (err) {
      const e = err?.response?.data?.error;
      setError(e?.field ?? 'typedName', { message: e?.message ?? 'Could not sign the offer.' });
    }
  });

  const startDate = offer?.startDate?.proposedByCandidate ?? offer?.startDate?.proposedByCompany;

  return (
    <Modal
      open
      onOpenChange={(v) => !v && dispatch(closeModal())}
      maxWidth="max-w-[500px]"
      title="Sign and accept"
      description={dotted(offer?.title, offer?.team, startDate && `starting ${fmtCalendarDate(startDate)}`)}
      footer={
        <>
          <ModalClose asChild><Button variant="secondary" size="lg">Cancel</Button></ModalClose>
          <Button variant="primary" size="lg" loading={accept.isPending} onClick={submit}>
            Sign and accept
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <label htmlFor="typedName" className="mb-[7px] block text-label-lg font-medium text-ink-chip">
          Type your full legal name
        </label>
        <input
          id="typedName"
          placeholder={fullName}
          aria-invalid={Boolean(errors.typedName) || undefined}
          {...register('typedName')}
          className={cn(
            'h-field-lg w-full rounded-control border bg-surface-card px-3 text-[19px] font-normal italic text-ink',
            'placeholder:not-italic placeholder:text-ink-muted',
            'transition-[border-color,box-shadow] duration-control focus:outline-none focus:shadow-focus',
            errors.typedName ? 'border-danger focus:border-danger' : 'border-line-control focus:border-accent'
          )}
        />
        <p className="mt-1.5 text-meta text-ink-muted">Must match {fullName} exactly.</p>
        {errors.typedName && (
          <p role="alert" className="mt-1.5 text-meta text-danger">{errors.typedName.message}</p>
        )}

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-button border border-line-control p-3.5">
          <input type="checkbox" {...register('agreed')} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
          <span className="text-body-sm text-ink-secondary">
            I have read the written offer and agree that this typed signature is legally binding,
            equivalent to a handwritten signature.
          </span>
        </label>
        {errors.agreed && (
          <p role="alert" className="mt-1.5 text-meta text-danger">{errors.agreed.message}</p>
        )}
      </form>
    </Modal>
  );
};
