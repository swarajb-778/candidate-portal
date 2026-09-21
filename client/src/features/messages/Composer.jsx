import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Paperclip, Send } from 'lucide-react';

import { Button } from '../../components/primitives/index.js';
import { showToast } from '../../store/slices/ui.js';
import { useSendMessage } from './queries.js';
import { cn } from '../../lib/cn.js';

const MAX_ROWS = 5;
const LINE_HEIGHT = 21;

export const Composer = ({ slug }) => {
  const dispatch = useDispatch();
  const [value, setValue] = useState('');
  const ref = useRef(null);
  const send = useSendMessage(slug);

  const empty = value.trim().length === 0;

  const submit = () => {
    if (empty) return;
    send.mutate(value.trim());
    setValue('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  // Grows to five rows, then scrolls.
  const grow = (el) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS * LINE_HEIGHT + 20)}px`;
  };

  return (
    <div className="flex items-end gap-2 border-t border-line-inner p-3.5">
      <Button
        variant="ghost"
        iconOnly
        size="md"
        aria-label="Attach a file"
        onClick={() => dispatch(showToast('Attachments are coming soon'))}
      >
        <Paperclip aria-hidden="true" size={17} strokeWidth={1.6} />
      </Button>

      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder="Write a message"
        aria-label="Write a message"
        onChange={(e) => { setValue(e.target.value); grow(e.target); }}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter starts a new line.
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        className={cn(
          'max-h-[125px] min-h-[42px] flex-1 resize-none rounded-control border border-line-input bg-surface-card px-3 py-2.5',
          'text-body text-ink placeholder:text-ink-muted',
          'transition-[border-color,box-shadow] duration-control focus:border-accent focus:shadow-focus focus:outline-none'
        )}
      />

      <Button variant="primary" iconOnly size="md" aria-label="Send message" disabled={empty} onClick={submit}>
        <Send aria-hidden="true" size={16} strokeWidth={1.8} />
      </Button>
    </div>
  );
};
