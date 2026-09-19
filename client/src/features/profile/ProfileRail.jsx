import { Link } from 'react-router';
import { Check, FileText } from 'lucide-react';

import { Button, Card, CardHeader, Switch } from '../../components/primitives/index.js';
import { useProfileMutation, patchVisibility } from './queries.js';
import { fileMeta, fmtDate } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export const ProfileRail = ({ profile, resume, tz }) => (
  <div className="flex flex-[0_1_314px] flex-col gap-3.5">
    <StrengthCard strength={profile.profileStrength} />
    <ResumeCard resume={resume} tz={tz} />
    <VisibilityCard profile={profile} tz={tz} />
  </div>
);

// The percentage comes from the server so client and server can never disagree.
const StrengthCard = ({ strength }) => {
  if (!strength) return null;
  const { percent, checks, remaining } = strength;

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-card-title font-semibold text-ink">Profile strength</h2>
        <span className="text-[15px] font-semibold text-accent-hover">{percent}%</span>
      </div>

      <div className="mt-3.5 h-[7px] w-full overflow-hidden rounded-full bg-neutral-bar">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-bar"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2.5 text-meta-lg text-ink-muted">
        {remaining === 0
          ? 'Everything is filled in. Recruiters see a complete profile.'
          : `${remaining} item${remaining === 1 ? '' : 's'} left to complete.`}
      </p>

      <ul className="mt-4 flex flex-col gap-2.5">
        {checks.map((c) => (
          <li key={c.key} className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full',
                c.done ? 'bg-success-bg text-success' : 'bg-neutral-pill text-ink-muted'
              )}
            >
              {c.done && <Check aria-hidden="true" size={11} strokeWidth={2.6} />}
            </span>
            <span className="text-meta-lg text-ink-secondary">{c.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const ResumeCard = ({ resume, tz }) => (
  <Card>
    <CardHeader title="Resume" />
    {resume ? (
      <>
        <div className="mt-3.5 flex items-center gap-3">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-icon bg-neutral-pill text-ink-secondary">
            <FileText aria-hidden="true" size={16} strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-label-lg font-medium text-ink">{resume.name}</p>
            <p className="mt-1 text-meta text-ink-muted">
              {fileMeta(resume.mimeType, resume.sizeBytes)} · {fmtDate(resume.uploadedAt, tz)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm">Replace</Button>
          <Link to="/documents"><Button variant="secondary" size="sm" tabIndex={-1}>All documents</Button></Link>
        </div>
      </>
    ) : (
      <p className="mt-3.5 text-body-sm text-ink-secondary">
        A resume is required before you can submit an application.
      </p>
    )}
  </Card>
);

const VisibilityCard = ({ profile, tz }) => {
  const save = useProfileMutation(patchVisibility);
  const checked = profile.visibility?.openToOtherRoles ?? false;

  return (
    <Card>
      <CardHeader title="Visibility" />
      <div className="mt-3.5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label-lg font-medium text-ink">Consider me for other roles</p>
          <p className="mt-1.5 text-meta-lg text-ink-muted">
            Recruiters hiring for similar roles can find your profile.
          </p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={(v) => save.mutate(v)}
          label="Consider me for other roles"
        />
      </div>
      <hr className="my-3.5 border-0 border-t border-line-inner" />
      <p className="text-meta text-ink-muted">Last updated {fmtDate(profile.updatedAt, tz)}</p>
    </Card>
  );
};
