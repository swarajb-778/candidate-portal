import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Eye } from 'lucide-react';

import { Button, Card, SkeletonCard } from '../../components/primitives/index.js';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { openModal } from '../../store/slices/ui.js';
import { setProfileSection } from '../../store/slices/drafts.js';
import { useZone } from '../auth/queries.js';
import { useDocuments } from '../documents/queries.js';
import { useProfile } from './queries.js';
import { PersonalSection, LinksSection, PreferencesSection, EeoSection } from './sections.jsx';
import { RepeatableRows } from './RepeatableRows.jsx';
import { SkillsCard } from './SkillsCard.jsx';
import { ProfileRail } from './ProfileRail.jsx';
import { dotted } from '../../lib/format.js';

export const Profile = () => {
  const dispatch = useDispatch();
  const tz = useZone();
  const [params, setParams] = useSearchParams();
  const { data: profile, isPending } = useProfile();
  const documents = useDocuments('mine');

  // Settings' "Change in Profile" arrives with the section already open.
  const wanted = params.get('edit');
  useEffect(() => {
    if (!wanted) return;
    dispatch(setProfileSection(wanted));
    setParams({}, { replace: true });
  }, [wanted, dispatch, setParams]);

  if (isPending) return <SkeletonCard lines={8} className="mx-auto max-w-page-full" />;

  const resume = documents.data?.items?.find((d) => d.kind === 'Resume');
  const activeCount = profile.activeApplications ?? 0;

  return (
    <div className="mx-auto max-w-page-full">
      <PageHeader
        title="Profile"
        sub="Your profile is shared with every hiring team you apply to."
        actions={
          <Button variant="secondary" size="md" onClick={() => dispatch(openModal({ modal: 'recruiterPreview' }))}>
            <Eye aria-hidden="true" size={15} strokeWidth={1.6} />
            Preview as recruiter
          </Button>
        }
      />

      <div className="flex flex-wrap gap-[clamp(14px,1.8vw,22px)]">
        <div className="flex flex-[1_1_520px] flex-col gap-3.5">
          <IdentityCard profile={profile} activeCount={activeCount} />
          <PersonalSection profile={profile} />
          <LinksSection profile={profile} />
          <PreferencesSection profile={profile} />
          <EeoSection profile={profile} />
          <RepeatableRows field="experience" rows={profile.experience} />
          <RepeatableRows field="education" rows={profile.education} />
          <SkillsCard skills={profile.skills} />
        </div>

        <ProfileRail profile={profile} resume={resume} tz={tz} />
      </div>
    </div>
  );
};

const IdentityCard = ({ profile, activeCount }) => {
  const dispatch = useDispatch();

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink text-[21px] font-semibold text-white">
          {profile.initials}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-value-lg font-semibold text-ink">{profile.fullName}</p>
          <p className="mt-1 text-body text-ink-secondary">
            {dotted(profile.preferences?.targetRole, profile.city)}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent-tint px-2.5 py-1.5 text-label font-medium text-accent-hover">
              {activeCount} active application{activeCount === 1 ? '' : 's'}
            </span>
            {profile.workAuth && (
              <span className="rounded-full bg-neutral-pill px-2.5 py-1.5 text-label font-medium text-ink-secondary">
                {profile.workAuth}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch(openModal({ modal: 'upload', payload: { intent: 'photo' } }))}
        >
          Change photo
        </Button>
      </div>
    </Card>
  );
};
