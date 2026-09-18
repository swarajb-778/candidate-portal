import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from '../../components/primitives/index.js';
import { setProfileSection } from '../../store/slices/drafts.js';

// Every editable profile card is the same shape: a heading, a CTA that swaps
// the body from read to edit, and Save/Cancel above a line-inner rule. Redux
// tracks only which section is open — the field values live in the form.
export const EditableSection = ({ id, title, cta = 'Edit', badge, children, read }) => {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.drafts.profileSection) === id;
  const close = () => dispatch(setProfileSection(null));

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 className="text-card-title font-semibold text-ink">{title}</h2>
          {badge}
        </div>
        {!open && (
          <Button variant="secondary" size="sm" onClick={() => dispatch(setProfileSection(id))}>
            {cta}
          </Button>
        )}
      </div>

      <div className="mt-4">{open ? children({ close }) : read}</div>
    </Card>
  );
};

export const EditActions = ({ onCancel, saving }) => (
  <div className="mt-5 flex flex-wrap gap-2.5 border-t border-line-inner pt-4">
    <Button type="submit" variant="primary" size="md" loading={saving}>Save changes</Button>
    <Button type="button" variant="secondary" size="md" onClick={onCancel}>Cancel</Button>
  </div>
);

// Read-mode cell: an overline label over the value.
export const ReadCell = ({ label, value }) => (
  <div>
    <p className="text-overline font-medium uppercase text-ink-muted">{label}</p>
    <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-ink">{value || '—'}</p>
  </div>
);

export const ReadGrid = ({ children, className = '' }) => (
  <div
    className={`grid gap-x-6 gap-y-[18px] ${className}`}
    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}
  >
    {children}
  </div>
);

export const EditGrid = ({ children }) => (
  <div
    className="grid gap-x-6 gap-y-4"
    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
  >
    {children}
  </div>
);
