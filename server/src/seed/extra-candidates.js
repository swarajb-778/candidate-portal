// Two candidates beyond the prototype's corpus, so list views and empty states
// can both be exercised. Their content isn't in seed-data.json — the shapes come
// from data-models.md.

export const asha = {
  user: {
    email: 'asha@example.com',
    firstName: 'Asha',
    lastName: 'Patel',
    settings: { timezone: 'America/New_York' }
  }
  // Nothing else: 0 applications, 0 documents, 0 notifications. Drives every
  // empty state and the 0% profile-strength bar.
};

export const miguel = {
  user: {
    email: 'miguel@example.com',
    firstName: 'Miguel',
    lastName: 'Torres',
    phone: '+1 (415) 555-0193',
    city: 'Oakland, CA',
    pronouns: 'He/Him',
    workAuth: 'Permanent Resident',
    links: { linkedin: 'linkedin.com/in/migueltorres', github: 'github.com/mtorres', site: '' },
    preferences: {
      targetRole: 'Staff Software Engineer',
      locations: 'Oakland · San Francisco · Remote',
      earliestStart: 'Within 60 days',
      workSetup: 'Remote',
      compensation: '$240,000 – $270,000'
    },
    eeo: { provided: true, gender: 'Male', veteran: 'I am not a protected veteran', disability: 'No' },
    experience: [
      {
        title: 'Staff Software Engineer', org: 'Baywide Logistics', period: 'Jan 2022 — Present',
        loc: 'Oakland, CA',
        desc: 'Owns the routing platform behind 4,000 daily deliveries. Led the move off a monolith with no customer-visible downtime.'
      },
      {
        title: 'Senior Software Engineer', org: 'Marin Robotics', period: 'Sep 2018 — Dec 2021',
        loc: 'San Rafael, CA',
        desc: 'Built the fleet control plane and the simulation harness the whole team tested against.'
      }
    ],
    education: [
      { school: 'UC Berkeley', degree: 'B.S. Electrical Engineering & Computer Science', period: '2012 — 2016', extra: 'Robotics focus' }
    ],
    skills: ['Go', 'Kubernetes', 'gRPC', 'Terraform', 'Postgres', 'Rust'],
    settings: { timezone: 'America/Los_Angeles', twoFactor: false }
  },

  // Five applications covering Draft, Withdrawn, Not Selected, Under Review and
  // Hired — enough to exercise every filter chip and the withdrawn treatment.
  applications: [
    {
      slug: 'hired-pl', title: 'Staff Software Engineer', team: 'Propulsion',
      location: 'Palo Alto, CA', employmentType: 'On-site · Full-time', reqRef: 'SWE-PL-1902',
      status: 'Hired', appliedAt: '2026-05-04T00:00:00Z',
      recruiter: { name: 'Marcus Webb', initials: 'MW', role: 'Technical Recruiter · Propulsion' },
      hiringManager: { name: 'Ines Rojas', role: 'Director of Engineering' },
      timeline: [
        { at: '2026-07-06T00:00:00Z', title: 'Offer accepted', text: 'Signed and countersigned. Onboarding will be in touch.', tone: 'success' },
        { at: '2026-06-29T00:00:00Z', title: 'Offer extended', text: 'Ines Rojas approved the offer and recruiting sent the written terms.', tone: 'success' },
        { at: '2026-06-18T00:00:00Z', title: 'Final panel completed', text: 'Five sessions with the Propulsion team.', tone: 'active' },
        { at: '2026-05-04T00:00:00Z', title: 'Application submitted', text: 'Resume attached.', tone: 'neutral' }
      ]
    },
    {
      slug: 'review-bt', title: 'Senior Backend Engineer', team: 'Battery Systems',
      location: 'Fremont, CA', employmentType: 'Hybrid · Full-time', reqRef: 'SWE-BT-2044',
      status: 'Under Review', appliedAt: '2026-08-14T00:00:00Z',
      recruiter: { name: 'Priya Raman', initials: 'PR', role: 'Recruiter · Battery Systems' },
      timeline: [
        { at: '2026-08-16T00:00:00Z', title: 'Application under review', text: 'Shared with the Battery Systems hiring team.', tone: 'active' },
        { at: '2026-08-14T00:00:00Z', title: 'Application submitted', text: 'Resume attached.', tone: 'neutral' }
      ]
    },
    {
      slug: 'draft-in', title: 'Infrastructure Engineer', team: 'Platform Infrastructure',
      location: 'Remote', employmentType: 'Remote · Full-time', reqRef: 'SWE-IN-2101',
      status: 'Draft', appliedAt: '2026-08-23T00:00:00Z',
      timeline: [
        { at: '2026-08-23T00:00:00Z', title: 'Draft started', text: 'Not submitted yet — finish the application to send it.', tone: 'neutral' }
      ]
    },
    {
      slug: 'withdrawn-qa', title: 'Software Engineer, Test Platform', team: 'Quality Engineering',
      location: 'Belmont, CA', employmentType: 'On-site · Full-time', reqRef: 'SWE-QA-1755',
      status: 'Withdrawn', appliedAt: '2026-06-11T00:00:00Z',
      closedAt: '2026-07-01T00:00:00Z', withdrawnAt: '2026-07-01T00:00:00Z',
      closeNote: 'You withdrew this application on Jul 1, 2026. Recruiting was notified.',
      recruiter: { name: 'Natalie Lara', initials: 'NL', role: 'Technical Recruiter · Quality Engineering' },
      timeline: [
        { at: '2026-07-01T00:00:00Z', title: 'Application withdrawn', text: 'You withdrew this application.', tone: 'neutral' },
        { at: '2026-06-11T00:00:00Z', title: 'Application submitted', text: 'Resume attached.', tone: 'neutral' }
      ]
    },
    {
      slug: 'closed-dx', title: 'Design Systems Engineer', team: 'Digital Experience',
      location: 'Remote', employmentType: 'Remote · Full-time', reqRef: 'SWE-DX-1188',
      status: 'Not Selected', appliedAt: '2026-04-19T00:00:00Z', closedAt: '2026-05-20T00:00:00Z',
      closeNote: 'The team moved forward with other candidates. Your profile stays on file.',
      recruiter: { name: 'Priya Raman', initials: 'PR', role: 'Recruiter · Digital Experience' },
      timeline: [
        { at: '2026-05-20T00:00:00Z', title: 'Not selected', text: 'Recruiting closed the application after the hiring team made a decision.', tone: 'neutral' },
        { at: '2026-04-19T00:00:00Z', title: 'Application submitted', text: 'Resume attached.', tone: 'neutral' }
      ]
    }
  ],

  documents: [
    { slug: 'resume', name: 'Resume_Miguel_Torres.pdf', kind: 'Resume', sizeBytes: 741376, uploadedAt: '2026-04-18T00:00:00Z', usedFor: ['hired-pl', 'review-bt', 'closed-dx'] }
  ],

  // An accepted offer, so the resolved offer screen has real data behind it.
  offer: {
    applicationSlug: 'hired-pl', stage: 'accepted',
    title: 'Staff Software Engineer', team: 'Propulsion',
    employmentType: 'Full-time · On-site', location: 'Palo Alto, CA',
    reportsTo: 'Ines Rojas, Director of Engineering',
    contingencies: ['Background check', 'Work authorization'],
    extendedAt: '2026-06-29T00:00:00Z', respondByAt: '2026-07-10T23:59:00Z',
    startDate: { proposedByCompany: '2026-08-03T00:00:00Z', confirmed: '2026-08-03T00:00:00Z' },
    startDateWindow: { min: '2026-07-20', max: '2026-10-19' },
    letter: { name: 'Offer_Letter_Staff_SWE.pdf', sizeBytes: 231424 },
    signature: { typedName: 'Miguel Torres', agreedAt: '2026-07-06T17:22:00Z', ip: '198.51.100.24' }
  },

  // All read — the bell shows no badge for this account.
  notifications: [
    { slug: 'm0', kind: 'application', title: 'Offer accepted', body: 'Your signed offer was received. Onboarding will reach out within two business days.', contextLabel: 'Staff Software Engineer — Propulsion', createdAt: '2026-07-06T17:25:00Z', readAt: '2026-07-06T18:00:00Z', action: { label: 'View application', target: 'application', targetSlug: 'hired-pl' } },
    { slug: 'm1', kind: 'application', title: 'Application under review', body: 'Your application is with the Battery Systems hiring team.', contextLabel: 'Senior Backend Engineer — Battery Systems', createdAt: '2026-08-16T16:00:00Z', readAt: '2026-08-16T19:00:00Z', action: { label: 'View application', target: 'application', targetSlug: 'review-bt' } },
    { slug: 'm2', kind: 'application', title: 'Not selected', body: 'The team moved forward with other candidates for this role.', contextLabel: 'Design Systems Engineer — Digital Experience', createdAt: '2026-05-20T18:00:00Z', readAt: '2026-05-21T09:00:00Z', action: { label: 'View application', target: 'application', targetSlug: 'closed-dx' } }
  ],

  threads: [
    {
      slug: 'marcus', participant: { name: 'Marcus Webb', role: 'Technical Recruiter', initials: 'MW' },
      applicationSlug: 'hired-pl', unreadCount: 0,
      messages: [
        { fromCandidate: false, sentAt: '2026-07-06T18:02:00Z', body: 'Congratulations Miguel — everything is signed on our side. Onboarding will email you this week.' },
        { fromCandidate: true, sentAt: '2026-07-06T19:14:00Z', body: 'Thank you Marcus. Looking forward to starting.' }
      ]
    }
  ]
};
