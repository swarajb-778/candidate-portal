import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalSchema, linksSchema, preferencesSchema, eeoSchema } from '@candidate-portal/shared/schemas/profile';
import { WORK_AUTH } from '@candidate-portal/shared/schemas/auth';

import { Field, Select, StatusPill } from '../../components/primitives/index.js';
import { EditableSection, EditActions, EditGrid, ReadCell, ReadGrid } from './EditableSection.jsx';
import { useProfileMutation, patchSection, patchEeo } from './queries.js';
import { dotted } from '../../lib/format.js';

const EEO_OPTIONS = {
  gender: ['Prefer not to say', 'Woman', 'Man', 'Non-binary', 'Self-describe'],
  veteran: ['Prefer not to say', 'I am not a protected veteran', 'I identify as a protected veteran'],
  disability: ['Prefer not to say', 'Yes', 'No']
};

export const PersonalSection = ({ profile }) => {
  const save = useProfileMutation(patchSection);

  return (
    <EditableSection
      id="personal"
      title="Personal information"
      read={
        <ReadGrid>
          <ReadCell label="Full name" value={profile.fullName} />
          <ReadCell label="Email" value={profile.email} />
          <ReadCell label="Phone" value={profile.phone} />
          <ReadCell label="Location" value={profile.city} />
          <ReadCell label="Work authorization" value={profile.workAuth} />
          <ReadCell label="Pronouns" value={profile.pronouns} />
        </ReadGrid>
      }
    >
      {({ close }) => <PersonalForm profile={profile} save={save} close={close} />}
    </EditableSection>
  );
};

const PersonalForm = ({ profile, save, close }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: profile.firstName ?? '', lastName: profile.lastName ?? '',
      email: profile.email ?? '', phone: profile.phone ?? '',
      city: profile.city ?? '', pronouns: profile.pronouns ?? '',
      workAuth: profile.workAuth ?? undefined
    }
  });

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values);
      close();
    } catch (err) {
      const e = err?.response?.data?.error;
      if (e?.field) setError(e.field, { message: e.message });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <EditGrid>
        <Field label="First name" {...register('firstName')} error={errors.firstName?.message} />
        <Field label="Last name" {...register('lastName')} error={errors.lastName?.message} />
        <Field label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Field label="Phone" {...register('phone')} error={errors.phone?.message} />
        <Field label="Location" {...register('city')} error={errors.city?.message} />
        <Select
          label="Work authorization"
          value={watch('workAuth')}
          onValueChange={(v) => setValue('workAuth', v, { shouldDirty: true })}
          options={WORK_AUTH}
        />
        <Field label="Pronouns" {...register('pronouns')} error={errors.pronouns?.message} />
      </EditGrid>
      <EditActions onCancel={close} saving={save.isPending} />
    </form>
  );
};

const LINK_PREFIX = { linkedin: 'in', github: 'gh', site: 'web' };

export const LinksSection = ({ profile }) => {
  const save = useProfileMutation(patchSection);

  return (
    <EditableSection
      id="links"
      title="Links & profiles"
      read={
        <div className="flex flex-col gap-2.5">
          {['linkedin', 'github', 'site'].map((k) => (
            <div key={k} className="flex items-baseline gap-3">
              <span className="w-[26px] shrink-0 text-meta-xs text-ink-muted">{LINK_PREFIX[k]}</span>
              {profile.links?.[k] ? (
                <a
                  href={`https://${profile.links[k]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-body text-accent hover:text-accent-hover"
                >
                  {profile.links[k]}
                </a>
              ) : (
                <span className="text-body text-ink-muted">—</span>
              )}
            </div>
          ))}
        </div>
      }
    >
      {({ close }) => <LinksForm profile={profile} save={save} close={close} />}
    </EditableSection>
  );
};

const LinksForm = ({ profile, save, close }) => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(linksSchema),
    defaultValues: { links: { linkedin: profile.links?.linkedin ?? '', github: profile.links?.github ?? '', site: profile.links?.site ?? '' } }
  });

  return (
    <form onSubmit={handleSubmit(async (v) => { await save.mutateAsync(v); close(); })} noValidate>
      <div className="flex flex-col gap-4">
        <Field label="LinkedIn" placeholder="linkedin.com/in/you" {...register('links.linkedin')} />
        <Field label="GitHub" placeholder="github.com/you" {...register('links.github')} />
        <Field label="Website" placeholder="you.dev" {...register('links.site')} />
      </div>
      <EditActions onCancel={close} saving={save.isPending} />
    </form>
  );
};

export const PreferencesSection = ({ profile }) => {
  const save = useProfileMutation(patchSection);
  const p = profile.preferences ?? {};

  return (
    <EditableSection
      id="prefs"
      title="Job preferences"
      read={
        <ReadGrid>
          <ReadCell label="Target role" value={p.targetRole} />
          <ReadCell label="Preferred locations" value={p.locations} />
          <ReadCell label="Earliest start" value={p.earliestStart} />
          <ReadCell label="Work setup" value={p.workSetup} />
          <ReadCell label="Compensation expectation" value={p.compensation} />
        </ReadGrid>
      }
    >
      {({ close }) => <PreferencesForm profile={profile} save={save} close={close} />}
    </EditableSection>
  );
};

const PreferencesForm = ({ profile, save, close }) => {
  const p = profile.preferences ?? {};
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferences: {
        targetRole: p.targetRole ?? '', locations: p.locations ?? '',
        earliestStart: p.earliestStart ?? '', workSetup: p.workSetup ?? '',
        compensation: p.compensation ?? ''
      }
    }
  });

  return (
    <form onSubmit={handleSubmit(async (v) => { await save.mutateAsync(v); close(); })} noValidate>
      <EditGrid>
        <Field label="Target role" {...register('preferences.targetRole')} />
        <Field label="Preferred locations" {...register('preferences.locations')} />
        <Field label="Earliest start" {...register('preferences.earliestStart')} />
        <Field label="Work setup" {...register('preferences.workSetup')} />
        <Field label="Compensation expectation" {...register('preferences.compensation')} />
      </EditGrid>
      <EditActions onCancel={close} saving={save.isPending} />
    </form>
  );
};

export const EeoSection = ({ profile }) => {
  const save = useProfileMutation(patchEeo);
  const provided = profile.eeo?.provided;

  return (
    <EditableSection
      id="eeo"
      title="Voluntary self-identification"
      cta={provided ? 'Update answers' : 'Answer the optional questions'}
      badge={
        <StatusPill
          tone={provided ? 'success' : 'neutral'}
          label={provided ? 'Provided' : 'Not provided'}
        />
      }
      read={
        <p className="text-body text-ink-secondary">
          Optional. Answers are used for equal-opportunity reporting only, are never shown to the
          hiring team, and have no effect on your application.
        </p>
      }
    >
      {({ close }) => <EeoForm profile={profile} save={save} close={close} />}
    </EditableSection>
  );
};

const EeoForm = ({ profile, save, close }) => {
  const { handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(eeoSchema),
    defaultValues: {
      gender: profile.eeo?.gender ?? 'Prefer not to say',
      veteran: profile.eeo?.veteran ?? 'Prefer not to say',
      disability: profile.eeo?.disability ?? 'Prefer not to say'
    }
  });

  return (
    <form onSubmit={handleSubmit(async (v) => { await save.mutateAsync(v); close(); })} noValidate>
      <p className="mb-4 text-body text-ink-secondary">
        Optional. Answers are used for equal-opportunity reporting only, are never shown to the
        hiring team, and have no effect on your application.
      </p>
      <EditGrid>
        <Select label="Gender" value={watch('gender')} onValueChange={(v) => setValue('gender', v)} options={EEO_OPTIONS.gender} />
        <Select label="Veteran status" value={watch('veteran')} onValueChange={(v) => setValue('veteran', v)} options={EEO_OPTIONS.veteran} />
        <Select label="Disability status" value={watch('disability')} onValueChange={(v) => setValue('disability', v)} options={EEO_OPTIONS.disability} />
      </EditGrid>
      <EditActions onCancel={close} saving={save.isPending} />
    </form>
  );
};
