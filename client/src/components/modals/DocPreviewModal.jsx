import { useDispatch, useSelector } from 'react-redux';

import { Button, Modal } from '../primitives/index.js';
import { closeModal } from '../../store/slices/ui.js';
import { downloadUrl, previewUrl } from '../../features/documents/queries.js';

export const DocPreviewModal = () => {
  const dispatch = useDispatch();
  const { slug, name, url } = useSelector((s) => s.ui.modalPayload) ?? {};

  // Documents address by slug; the offer letter passes its own endpoint.
  const src = url ?? previewUrl(slug);
  const download = url ?? downloadUrl(slug);

  return (
    <Modal
      open
      onOpenChange={(v) => !v && dispatch(closeModal())}
      maxWidth="max-w-[560px]"
      overlayClassName="bg-scrim-strong"
      showClose
      title={name}
      footer={
        <a href={download} download>
          <Button variant="secondary" size="lg" tabIndex={-1}>Download</Button>
        </a>
      }
    >
      <div className="flex justify-center rounded-control bg-surface-preview p-5">
        {/* The real document, not a placeholder page. */}
        <iframe
          title={`Preview of ${name}`}
          // The design shows a bare page, so the viewer's own toolbar and side
          // panes are suppressed and the page is fitted to the frame width.
          src={`${src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          className="aspect-[8.5/11] w-full max-w-[360px] rounded-tag border-0 bg-surface-card shadow-paper"
        />
      </div>
      <p className="mt-4 border-t border-line-inner pt-3.5 text-meta text-ink-muted">
        Preview only — download for the full document.
      </p>
    </Modal>
  );
};
