import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check } from 'lucide-react';
import { clearToast } from '../../store/slices/ui.js';
import { cn } from '../../lib/cn.js';

const DISMISS_MS = 2800;

// Not a dialog — a polite live region that never takes focus. Sits clear of the
// mobile tab bar.
export const Toast = () => {
  const toast = useSelector((s) => s.ui.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => dispatch(clearToast()), DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[88px] z-50 flex justify-center px-5"
    >
      {toast && <ToastStrip message={toast.message} />}
    </div>
  );
};

export const ToastStrip = ({ message, className }) => (
  <div
    className={cn(
      'flex items-center gap-2.5 rounded-button bg-ink px-4 py-3 text-body-sm font-medium text-white shadow-toast',
      className
    )}
  >
    <span
      aria-hidden="true"
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[.16]"
    >
      <Check aria-hidden="true" size={11} strokeWidth={2.4} />
    </span>
    {message}
  </div>
);
