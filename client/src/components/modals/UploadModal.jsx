import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, Check, Upload } from 'lucide-react';

import { Button, Modal, ModalClose } from '../primitives/index.js';
import { apiError } from '../../lib/api.js';
import { fileSize } from '../../lib/format.js';
import { closeModal, showToast } from '../../store/slices/ui.js';
import { useUpload } from '../../features/documents/queries.js';
import { cn } from '../../lib/cn.js';

const TITLES = {
  new: 'Upload a document',
  replace: 'Replace document',
  request: 'Upload candidate questionnaire',
  photo: 'Upload a profile photo',
  resume: 'Replace your resume'
};

export const UploadModal = () => {
  const dispatch = useDispatch();
  const payload = useSelector((s) => s.ui.modalPayload) ?? {};
  const intent = payload.intent ?? 'new';

  const [pct, setPct] = useState(0);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const upload = useUpload({ onProgress: setPct });

  const start = (chosen) => {
    if (!chosen) return;
    setFile(chosen);
    setPct(0);
    upload.mutate(
      {
        file: chosen,
        kind: payload.kind,
        applicationSlug: payload.applicationSlug,
        replaceSlug: payload.replaceSlug
      },
      { onSuccess: () => dispatch(showToast(`${chosen.name} uploaded`)) }
    );
  };

  const state = upload.isPending ? 'uploading' : upload.isError ? 'error' : upload.isSuccess ? 'done' : 'idle';
  const error = upload.isError ? apiError(upload.error) : null;

  return (
    <Modal
      open
      onOpenChange={(v) => !v && dispatch(closeModal())}
      maxWidth="max-w-[500px]"
      title={TITLES[intent] ?? TITLES.new}
      footer={
        state === 'done' ? (
          <ModalClose asChild><Button variant="primary" size="lg">Done</Button></ModalClose>
        ) : state === 'error' ? (
          <>
            <ModalClose asChild><Button variant="secondary" size="lg">Cancel</Button></ModalClose>
            <Button variant="primary" size="lg" onClick={() => { upload.reset(); inputRef.current?.click(); }}>
              Try another file
            </Button>
          </>
        ) : (
          <ModalClose asChild><Button variant="secondary" size="lg">Cancel</Button></ModalClose>
        )
      }
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => start(e.target.files?.[0])}
      />

      {state === 'idle' && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); start(e.dataTransfer.files?.[0]); }}
          className={cn(
            'flex w-full flex-col items-center rounded-card border border-dashed py-[34px]',
            'transition-[background-color,border-color] duration-control',
            dragging
              ? 'border-accent bg-accent-wash'
              : 'border-line-controlHover bg-surface-sunken hover:border-accent hover:bg-accent-wash'
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent">
            <Upload aria-hidden="true" size={18} strokeWidth={1.6} />
          </span>
          <span className="mt-3 text-[13.5px] font-medium text-ink">Choose a file</span>
          <span className="mt-1.5 text-meta-lg text-ink-muted">PDF or DOCX · up to 10 MB</span>
        </button>
      )}

      {state === 'uploading' && (
        <div>
          <p className="truncate text-body font-medium text-ink">{file?.name}</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-bar">
            <div className="h-full rounded-full bg-accent transition-[width] duration-bar" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-meta-lg text-ink-muted">{pct}% · uploading</p>
        </div>
      )}

      {state === 'error' && (
        <div role="alert" className="flex items-start gap-2.5 rounded-button border border-danger-border bg-danger-bg p-3.5">
          <AlertCircle aria-hidden="true" size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-danger" />
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-danger">Couldn’t upload {file?.name}</p>
            <p className="mt-1 text-body-sm text-danger-text">
              {error?.message ?? 'Something went wrong. Try again.'}
            </p>
          </div>
        </div>
      )}

      {state === 'done' && (
        <div className="flex items-center gap-3 rounded-button border border-success-border bg-success-bgAlt p-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
            <Check aria-hidden="true" size={16} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-body font-medium text-ink">{file?.name}</p>
            <p className="mt-1 text-meta text-success-text">{fileSize(file?.size)} · uploaded</p>
          </div>
        </div>
      )}
    </Modal>
  );
};
