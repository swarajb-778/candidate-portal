# Candidate Portal

A candidate-facing hiring portal. An applicant signs in and sees everywhere their
applications stand: status and timeline per application, scheduled interviews with
prep material, threads with recruiters, uploaded and requested documents, an offer
they can review and sign, and a profile that carries across every application.

Sixteen routes, nine modals, fully responsive.

## Layout

```
candidate-portal/
├── shared/schemas/     zod schemas used by both sides
├── client/src/
│   ├── components/     primitives, chrome, modals, shared
│   ├── features/       one folder per screen
│   ├── lib/            axios, query keys, date + format helpers
│   └── store/          Redux slices (ui, filters, drafts)
└── server/src/
    ├── models/         six Mongoose collections
    ├── routes/         REST endpoints under /api/v1
    └── seed/           npm run seed
```

## Running it

```bash
npm install
cp server/.env.example server/.env   # add your MONGODB_URI and JWT_SECRET
npm run seed                          # wipe and load the demo corpus
npm run server                        # API on :4000
npm run dev                           # client on :5173
```

`npm run seed` slides the demo dates to today so the portal always has an upcoming
interview. Use `npm run seed -- --literal` to load the corpus dates verbatim.

Three seeded accounts, all with the password `portal1234`:

| Account | What it exercises |
| --- | --- |
| `swaraj@example.com` | The full corpus — 3 applications, a panel day, 3 threads, 4 documents, a pending offer |
| `asha@example.com` | A brand-new account — every empty state and the 0% profile-strength bar |
| `miguel@example.com` | 5 applications across all statuses, an already-accepted offer |
