import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { experienceSchema, educationSchema } from '@candidate-portal/shared/schemas/profile';
import { Plus } from 'lucide-react';

import { Button, Card, Field } from '../../components/primitives/index.js';
import { useProfileMutation, addRow, editRow, removeRow } from './queries.js';
import { dotted } from '../../lib/format.js';

const CONFIG = {
  experience: {
    title: 'Work experience',
    addLabel: 'Add position',
    saveLabel: 'Save position',
    schema: experienceSchema,
    blank: { title: '', org: '', period: '', loc: '', desc: '' },
    heading: (r) => r.title,
    sub: (r) => dotted(r.org, r.period, r.loc),
    body: (r) => r.desc,
    fields: [
      ['title', 'Title'], ['org', 'Organisation'], ['period', 'Period'], ['loc', 'Location']
    ],
    textarea: ['desc', 'Description']
  },
  education: {
    title: 'Education',
    addLabel: 'Add school',
    saveLabel: 'Save school',
    schema: educationSchema,
    blank: { school: '', degree: '', period: '', extra: '' },
    heading: (r) => r.school,
    sub: (r) => dotted(r.degree, r.period),
    body: (r) => r.extra,
    fields: [
      ['school', 'School'], ['degree', 'Degree'], ['period', 'Period'], ['extra', 'Honours or focus']
    ],
    textarea: null
  }
};

export const RepeatableRows = ({ field, rows = [] }) => {
  const cfg = CONFIG[field];
  // `null` = nothing open, 'new' = the appended blank row, otherwise a row id.
  const [editing, setEditing] = useState(null);

  const save = useProfileMutation((vars) =>
    vars.id ? editRow(field, vars.id, vars.body) : addRow(field, vars.body)
  );
  const destroy = useProfileMutation((id) => removeRow(field, id));

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-card-title font-semibold text-ink">{cfg.title}</h2>
        <Button variant="secondary" size="sm" onClick={() => setEditing('new')}>
          <Plus aria-hidden="true" size={14} strokeWidth={1.8} />
          {cfg.addLabel}
        </Button>
      </div>

      <div className="mt-2">
        {rows.map((row) => (
          <div key={row._id} className="border-t border-line-inner py-4 first:border-t-0">
            {editing === row._id ? (
              <RowForm
                cfg={cfg}
                defaults={row}
                saving={save.isPending}
                onCancel={() => setEditing(null)}
                onRemove={async () => { await destroy.mutateAsync(row._id); setEditing(null); }}
                onSubmit={async (body) => { await save.mutateAsync({ id: row._id, body }); setEditing(null); }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditing(row._id)}
                className="w-full rounded-control text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <p className="text-item font-semibold text-ink">{cfg.heading(row)}</p>
                <p className="mt-1 text-body-sm text-ink-secondary">{cfg.sub(row)}</p>
                {cfg.body(row) && (
                  <p className="mt-1.5 max-w-[62ch] text-body-sm text-ink-secondary">{cfg.body(row)}</p>
                )}
              </button>
            )}
          </div>
        ))}

        {editing === 'new' && (
          <div className="border-t border-line-inner py-4">
            <RowForm
              cfg={cfg}
              defaults={cfg.blank}
              saving={save.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={async (body) => { await save.mutateAsync({ body }); setEditing(null); }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

const RowForm = ({ cfg, defaults, onSubmit, onCancel, onRemove, saving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(cfg.schema),
    defaultValues: defaults
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-x-6 gap-y-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {cfg.fields.map(([name, label]) => (
          <Field key={name} label={label} {...register(name)} error={errors[name]?.message} />
        ))}
      </div>

      {cfg.textarea && (
        <div className="mt-4">
          <Field as="textarea" rows={3} label={cfg.textarea[1]} {...register(cfg.textarea[0])} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-line-inner pt-4">
        <Button type="submit" variant="primary" size="md" loading={saving}>{cfg.saveLabel}</Button>
        <Button type="button" variant="secondary" size="md" onClick={onCancel}>Cancel</Button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="ml-auto text-danger hover:bg-danger-bgAlt hover:text-danger-hover"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
    </form>
  );
};
