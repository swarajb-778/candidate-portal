import { useState } from 'react';
import { X } from 'lucide-react';

import { Button, Card, Field } from '../../components/primitives/index.js';
import { useProfileMutation, putSkills } from './queries.js';

export const SkillsCard = ({ skills = [] }) => {
  const [draft, setDraft] = useState('');
  const save = useProfileMutation(putSkills);

  // Enter adds; duplicates are silently ignored.
  const add = () => {
    const value = draft.trim();
    setDraft('');
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) return;
    save.mutate([...skills, value]);
  };

  return (
    <Card>
      <h2 className="text-card-title font-semibold text-ink">Skills</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-chip bg-surface-page py-1.5 pl-3 pr-1.5 text-label-lg font-medium text-ink-chip"
          >
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={() => save.mutate(skills.filter((s) => s !== skill))}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-knob text-ink-secondary transition-[background-color,color] duration-control hover:bg-line-controlHover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X aria-hidden="true" size={10} strokeWidth={2.4} />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2.5">
        <div className="min-w-[220px] flex-1">
          <Field
            label="Add a skill"
            placeholder="Add a skill and press Enter"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
        </div>
        <Button variant="secondary" size="md" onClick={add} loading={save.isPending}>Add</Button>
      </div>
    </Card>
  );
};
