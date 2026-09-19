import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema } from '@candidate-portal/shared/schemas/settings';
import { Check } from 'lucide-react';

import { Button, Card, CardHeader, Field, Select, Switch } from '../../components/primitives/index.js';
import { qk } from '../../lib/queryKeys.js';
import { fmtDate, fmtStamp } from '../../lib/format.js';
import {
  useSessions, useSettingsMutation, changePassword, patchSettings, patchTwoFactor, revokeSession
} from './queries.js';

const LANGUAGES = ['English (US)', 'English (UK)', 'Deutsch', 'Español'];
const ZONES = ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'Europe/London', 'Asia/Kolkata'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD.MM.YYYY'];

export const AccountTab = ({ me, tz }) => (
  <div className="flex flex-col gap-3.5">
    <SignInEmailCard me={me} />
    <PasswordCard me={me} tz={tz} />
    <TwoFactorCard me={me} />
    <DevicesCard tz={tz} />
    <LanguageCard me={me} />
  </div>
);

const SignInEmailCard = ({ me }) => (
  <Card>
    <CardHeader
      title="Sign-in email"
      action={
        // Routes to Profile with the personal section already open.
        <Link to="/profile?edit=personal">
          <Button variant="secondary" size="sm" tabIndex={-1}>Change in Profile</Button>
        </Link>
      }
    />
    <p className="mt-3.5 text-body font-medium text-ink">{me.email}</p>
    <p className="mt-1.5 text-meta-lg text-ink-muted">
      Used to sign in and to reach you about applications. Changing it signs you out of other devices.
    </p>
  </Card>
);

const PasswordCard = ({ me, tz }) => {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const save = useSettingsMutation(changePassword);

  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: '', next: '', confirm: '' }
  });

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values);
      reset();
      setOpen(false);
      setDone(true);
    } catch (err) {
      const e = err?.response?.data?.error;
      setError(e?.field ?? 'current', { message: e?.message ?? 'Could not change your password.' });
    }
  });

  if (done) {
    return (
      <Card>
        <CardHeader title="Password" />
        <p className="mt-3.5 flex items-center gap-2.5 rounded-button border border-success-border bg-success-bgAlt p-3.5 text-body-sm text-success-text">
          <Check aria-hidden="true" size={15} strokeWidth={2} className="shrink-0 text-success" />
          Password updated. You’ll stay signed in on this device.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Password"
        action={!open && <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Change password</Button>}
      />
      <p className="mt-3.5 text-meta-lg text-ink-muted">Last changed {fmtDate(me.passwordChangedAt, tz)}</p>

      {open && (
        <form onSubmit={submit} noValidate className="mt-4 border-t border-line-inner pt-4">
          <div className="flex max-w-[420px] flex-col gap-4">
            <Field label="Current password" type="password" {...register('current')} error={errors.current?.message} />
            <Field
              label="New password"
              type="password"
              hint="At least 8 characters, including a number."
              {...register('next')}
              error={errors.next?.message}
            />
            <Field label="Confirm new password" type="password" {...register('confirm')} error={errors.confirm?.message} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button type="submit" variant="primary" size="md" loading={save.isPending}>Update password</Button>
            <Button type="button" variant="secondary" size="md" onClick={() => { reset(); setOpen(false); }}>Cancel</Button>
          </div>
        </form>
      )}
    </Card>
  );
};

const TwoFactorCard = ({ me }) => {
  const save = useSettingsMutation(patchTwoFactor);
  const on = me.settings?.twoFactor ?? false;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-card-title font-semibold text-ink">Two-factor authentication</h2>
          <p className="mt-1.5 text-body-sm text-ink-secondary">
            A code is sent to {me.phone || 'your phone'} when you sign in on a new device.
          </p>
        </div>
        <Switch checked={on} onCheckedChange={(v) => save.mutate(v)} label="Two-factor authentication" />
      </div>

      {!on && (
        <p className="mt-3.5 rounded-button border border-warning-border bg-warning-bgAlt p-3.5 text-body-sm text-warning-text">
          Off. Your account is protected by password only.
        </p>
      )}
    </Card>
  );
};

const DevicesCard = ({ tz }) => {
  const { data } = useSessions();
  const revoke = useSettingsMutation(revokeSession, { invalidate: [qk.sessions] });

  return (
    <Card>
      <CardHeader title="Signed-in devices" />
      <ul className="mt-2">
        {data?.items?.map((d) => (
          <li key={d.key} className="flex flex-wrap items-center gap-3 border-t border-line-inner py-3.5 first:border-t-0">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-label-lg font-medium text-ink">
                {d.name}
                {d.current && (
                  <span className="rounded-tag bg-success-bg px-1.5 py-1 text-overline-sm font-medium uppercase text-success">
                    This device
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-meta-lg text-ink-muted">
                {d.location} · {d.current ? 'Active now' : fmtStamp(d.lastActive, tz)}
              </p>
            </div>
            {!d.current && (
              <Button variant="secondary" size="sm" onClick={() => revoke.mutate(d.key)}>Sign out</Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

const LanguageCard = ({ me }) => {
  const save = useSettingsMutation(patchSettings);
  const s = me.settings ?? {};

  return (
    <Card>
      <CardHeader title="Language & region" />
      <div className="mt-4 grid gap-x-6 gap-y-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Select label="Language" value={s.language} onValueChange={(v) => save.mutate({ language: v })} options={LANGUAGES} />
        <Select label="Time zone" value={s.timezone} onValueChange={(v) => save.mutate({ timezone: v })} options={ZONES} />
        <Select label="Date format" value={s.dateFormat} onValueChange={(v) => save.mutate({ dateFormat: v })} options={DATE_FORMATS} />
      </div>
      <p className="mt-4 text-meta-lg text-ink-muted">
        Interview times are always shown in your time zone: {s.timezone}.
      </p>
    </Card>
  );
};
