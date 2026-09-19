import { Card, CardHeader, LockedSwitch, Select, Switch } from '../../components/primitives/index.js';
import { useSettingsMutation, patchChannels, patchSettings } from './queries.js';

const ROWS = [
  { key: 'status',    name: 'Application status changes',   desc: 'Moved forward, on hold, or closed' },
  { key: 'interview', name: 'Interview invitations',        desc: 'Invites, reschedules and reminders' },
  { key: 'messages',  name: 'Messages from recruiters',     desc: 'New replies in your threads' },
  { key: 'docs',      name: 'Document requests',            desc: 'Files the hiring team needs from you' },
  { key: 'matches',   name: 'New roles matching my profile', desc: "Openings you haven't applied to" }
];

const CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'sms',   label: 'SMS' },
  { key: 'app',   label: 'In-app' }
];

const GRID = { gridTemplateColumns: 'minmax(150px, 1fr) 62px 62px 62px' };

export const NotificationsTab = ({ me }) => (
  <div className="flex flex-col gap-3.5">
    <ChannelsCard me={me} />
    <PauseCard me={me} />
  </div>
);

const ChannelsCard = ({ me }) => {
  const save = useSettingsMutation(patchChannels);
  const n = me.settings?.notifications ?? {};

  return (
    <Card>
      <CardHeader title="How we reach you" />
      <p className="mt-2.5 text-meta-lg text-ink-muted">
        Interview invitations and reschedules are always sent by email — that channel can’t be turned off.
      </p>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="grid items-center gap-y-4" style={GRID}>
            <span />
            {CHANNELS.map((c) => (
              <span key={c.key} className="text-center text-overline-sm font-medium uppercase text-ink-muted">
                {c.label}
              </span>
            ))}

            {ROWS.map((row) => (
              <Row key={row.key} row={row} values={n[row.key] ?? {}} save={save} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const Row = ({ row, values, save }) => (
  <>
    <div className="border-t border-line-list pt-4">
      <p className="text-label-lg font-medium text-ink">{row.name}</p>
      <p className="mt-1.5 text-meta text-ink-muted">{row.desc}</p>
    </div>

    {CHANNELS.map((c) => {
      // Interview invitations by email is locked on — not a button at all.
      const locked = row.key === 'interview' && c.key === 'email';
      return (
        <div key={c.key} className="flex justify-center border-t border-line-list pt-4">
          {locked ? (
            <LockedSwitch />
          ) : (
            <Switch
              checked={Boolean(values[c.key])}
              onCheckedChange={(v) => save.mutate({ [row.key]: { [c.key]: v } })}
              label={`${row.name} — ${c.label}`}
            />
          )}
        </div>
      );
    })}
  </>
);

const PauseCard = ({ me }) => {
  const save = useSettingsMutation(patchSettings);
  const s = me.settings ?? {};

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-card-title font-semibold text-ink">Pause non-urgent notifications</h2>
          <p className="mt-1.5 text-body-sm text-ink-secondary">
            Holds role matches and general updates. Interview and message alerts still come through.
          </p>
        </div>
        <Switch
          checked={Boolean(s.pauseNonUrgent)}
          onCheckedChange={(v) => save.mutate({ pauseNonUrgent: v })}
          label="Pause non-urgent notifications"
        />
      </div>

      <hr className="my-4 border-0 border-t border-line-inner" />

      <div className="max-w-[280px]">
        <Select
          label="Summary email"
          value={s.digest}
          onValueChange={(v) => save.mutate({ digest: v })}
          options={['Off', 'Daily', 'Weekly on Monday']}
        />
      </div>
    </Card>
  );
};
