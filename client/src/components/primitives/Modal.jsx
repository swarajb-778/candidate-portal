import { useEffect, useLayoutEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn.js';

// Modals here are opened from Redux state, not from a Dialog.Trigger — several
// are opened by a kebab item that unmounts itself, so Radix has no trigger node
// to restore focus to. Remember the opener ourselves. This layout effect runs
// before Radix's focus scope (a passive effect), so activeElement is still the
// element that opened the dialog.

// Every modal in the design closes on Escape and on overlay click — that's
// Radix's default and it stays on. Focus returns to the trigger.
export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  footer,
  maxWidth = 'max-w-[560px]',
  showClose = false,
  overlayClassName,
  className,
  children
}) => {
  const openerRef = useRef(null);
  const wasOpen = useRef(false);

  useLayoutEffect(() => {
    if (open) openerRef.current = document.activeElement;
  }, [open]);

  // Restore on the close transition rather than in onCloseAutoFocus: Radix's
  // own focus scope runs after that callback and would win.
  useEffect(() => {
    if (wasOpen.current && !open) {
      const opener = openerRef.current;
      if (opener?.isConnected) opener.focus();
    }
    wasOpen.current = open;
  }, [open]);

  return (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className={cn('fixed inset-0 z-40 bg-scrim', overlayClassName)} />
      <Dialog.Content
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex w-[calc(100vw-40px)] -translate-x-1/2 -translate-y-1/2 flex-col',
          'max-h-[86vh] rounded-modal bg-surface-card p-modal shadow-modal focus:outline-none',
          maxWidth,
          className
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="text-modal-title font-semibold text-ink">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1.5 text-body-sm text-ink-secondary">
                  {description}
                </Dialog.Description>
              )}
            </div>
            {showClose && (
              <Dialog.Close
                aria-label="Close"
                className="-mr-1 -mt-1 flex h-ctl w-9 shrink-0 items-center justify-center rounded-icon text-ink-subtle transition-[background-color,color] duration-control hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X aria-hidden="true" size={18} strokeWidth={1.6} />
              </Dialog.Close>
            )}
          </div>
        )}

        <div className="-mx-1 mt-4 flex-1 overflow-y-auto px-1">{children}</div>

        {footer && <div className="mt-5 flex flex-wrap justify-end gap-2.5">{footer}</div>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  );
};

export const ModalClose = Dialog.Close;
