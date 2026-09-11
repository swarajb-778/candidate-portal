import { cn } from '../../lib/cn.js';

const FEATURES = [
  { dot: 'bg-accent',          copy: 'Track each application by stage' },
  { dot: 'bg-authdot-amber',   copy: 'See what needs your action, and when' },
  { dot: 'bg-authdot-green',   copy: 'Interview details, documents and messages' }
];

// Login and the sign-up wizard share this shell. The context panel is hidden
// below `app:` — mobile gets the form only.
export const AuthPanel = ({ children }) => (
  <div className="flex min-h-screen flex-wrap">
    <aside
      className="relative hidden min-w-[320px] flex-[1_1_46%] flex-col overflow-hidden bg-ink p-[clamp(32px,5vw,64px)] app:flex"
      // The one gradient in the product: a very subtle lift in the top-right.
      style={{
        backgroundImage:
          'radial-gradient(circle at 100% 0%, rgba(58,111,247,.16) 0%, rgba(58,111,247,0) 60%)'
      }}
    >
      <div>
        <p className="text-[12px] font-semibold uppercase leading-none tracking-[0.04em] text-white">
          Rivian &amp; VW Tech
        </p>
        <span aria-hidden="true" className="mt-2.5 block h-0.5 w-7 bg-accent" />
        <p className="mt-3 text-body text-white/[.62]">Candidate Portal</p>
      </div>

      <h2 className="mt-auto max-w-[15ch] text-auth-title font-semibold text-white">
        One place for every step of your application.
      </h2>

      <ul className="mt-7 rounded-card border border-white/[.07]">
        {FEATURES.map((f, i) => (
          <li
            key={f.copy}
            className={cn(
              'flex items-start gap-3 px-4 py-3.5',
              i > 0 && 'border-t border-white/[.07]'
            )}
          >
            <span aria-hidden="true" className={cn('mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full', f.dot)} />
            <span className="text-body leading-normal text-white/[.78]">{f.copy}</span>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-10 text-meta-xs leading-normal text-white/[.38]">
        Unofficial candidate portal concept created for demonstration purposes.
      </p>
    </aside>

    <main className="flex flex-[1_1_54%] items-center justify-center bg-surface-card p-[clamp(28px,5vw,56px)]">
      <div className="w-full max-w-[400px]">{children}</div>
    </main>
  </div>
);

export const AuthHeading = ({ title, sub }) => (
  <div className="mb-6">
    <h1 className="text-auth-title font-semibold text-ink">{title}</h1>
    {sub && <p className="mt-2 text-body-lg text-ink-secondary">{sub}</p>}
  </div>
);

// One inline row above the submit button: a 15px danger circle, then the copy.
export const AuthError = ({ children }) =>
  children ? (
    <p role="alert" className="mb-3.5 flex items-center gap-2 text-[12.5px] leading-normal text-danger">
      <span
        aria-hidden="true"
        className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-danger text-[10px] font-bold leading-none text-white"
      >
        !
      </span>
      {children}
    </p>
  ) : null;
