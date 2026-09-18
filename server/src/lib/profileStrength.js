// Computed server-side so the client and server can never disagree — the rail
// renders whatever this returns.
export const PROFILE_CHECKS = [
  { key: 'personal',   label: 'Personal information' },
  { key: 'resume',     label: 'Resume uploaded' },
  { key: 'links',      label: 'Links & profiles' },
  { key: 'experience', label: 'Work experience' },
  { key: 'education',  label: 'Education' },
  { key: 'skills',     label: 'Skills (5 or more)' },
  { key: 'prefs',      label: 'Job preferences' },
  { key: 'eeo',        label: 'Self-identification' }
];

export const profileStrength = (u, hasResume) => {
  const done = [
    Boolean(u.email && u.phone && u.city),
    hasResume,
    Boolean(u.links?.linkedin && u.links?.github),
    (u.experience?.length ?? 0) > 0,
    (u.education?.length ?? 0) > 0,
    (u.skills?.length ?? 0) >= 5,
    Boolean(u.preferences?.targetRole),
    Boolean(u.eeo?.provided)
  ];

  return {
    percent: Math.round((done.filter(Boolean).length / done.length) * 100),
    checks: PROFILE_CHECKS.map((c, i) => ({ ...c, done: done[i] })),
    remaining: done.filter((d) => !d).length
  };
};
