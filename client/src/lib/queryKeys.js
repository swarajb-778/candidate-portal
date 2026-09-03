export const qk = {
  me:                       ['me'],
  profile:                  ['profile'],
  recruiterView:            ['profile', 'recruiter-view'],
  applications: (f) =>      ['applications', f ?? {}],
  application:  (slug) =>   ['application', slug],
  interviews:   (tab) =>    ['interviews', tab],
  interview:    (slug) =>   ['interview', slug],
  availabilityRequest:      ['availability', 'request'],
  availabilitySlots: (d) => ['availability', 'slots', d],
  documents:    (tab) =>    ['documents', tab],
  threads:                  ['threads'],
  messages:     (slug) =>   ['messages', slug],
  notifications:(f) =>      ['notifications', f ?? 'all'],
  offer:        (slug) =>   ['offer', slug],
  sessions:                 ['sessions'],
  exportJob:    (id) =>     ['export', id],
  faq:                      ['faq']
};
