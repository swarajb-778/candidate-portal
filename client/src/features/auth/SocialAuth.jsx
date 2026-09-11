import { Button } from '../../components/primitives/index.js';

// Two providers, not three. There are no logo files in this product — the mark
// is a neutral tile, exactly as the design reference renders it.
const PROVIDERS = [
  { id: 'google', label: 'Google' },
  { id: 'linkedin', label: 'LinkedIn' }
];

export const SocialAuth = ({ onSelect, pending }) => (
  <>
    <div className="my-6 flex items-center gap-3">
      <span aria-hidden="true" className="h-px flex-1 bg-line-card" />
      <span className="text-meta text-ink-muted">or continue with</span>
      <span aria-hidden="true" className="h-px flex-1 bg-line-card" />
    </div>

    <div className="flex gap-2.5">
      {PROVIDERS.map((p) => (
        <Button
          key={p.id}
          size="lg"
          variant="secondary"
          className="flex-1 text-body-sm"
          disabled={pending}
          onClick={() => onSelect(p.id)}
        >
          <span aria-hidden="true" className="h-[18px] w-[18px] shrink-0 rounded-tag bg-neutral-pill" />
          {p.label}
        </Button>
      ))}
    </div>
  </>
);
