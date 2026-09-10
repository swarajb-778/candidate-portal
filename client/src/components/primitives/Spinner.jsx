import { cn } from '../../lib/cn.js';

// The one spinner in the product: 700ms linear, infinite. Reduced motion stops
// it via the global rule in styles/index.css.
export const Spinner = ({ className }) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-block h-[15px] w-[15px] shrink-0 rounded-full border-2 border-current border-t-transparent',
      '[animation:spin_700ms_linear_infinite]',
      className
    )}
  />
);
