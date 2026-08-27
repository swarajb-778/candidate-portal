# Data models — Mongoose schemas

MongoDB Atlas cluster. Six collections. Everything the UI renders maps to one of
these; nothing in the design needs a field that isn't here.

Conventions used throughout:

- `_id` is the Mongo ObjectId; the design's short ids (`cc`, `vp`, `dx`, `n0`,
  `f1`) become a `slug` field so seeded URLs stay stable and readable.
- Money, dates and durations are stored as real types. **Do not store the
  pre-formatted display strings** from the prototype (`'PDF · 842 KB'`,
  `'Applied Jul 18, 2026'`) — those are view concerns. Format on the client with
  `date-fns` so timezone and locale stay correct.
- Enum values are exactly the strings the UI switches on.

---

## `users`

```js
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },

  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  phone:        { type: String, trim: true },
  city:         { type: String, trim: true },
  pronouns:     { type: String, trim: true },
  workAuth:     { type: String, enum: ['US Citizen', 'Permanent Resident', 'Visa holder', 'Need sponsorship'] },

  links: {
    linkedin: String,
    github:   String,
    site:     String
  },

  preferences: {
    targetRole:   String,
    locations:    String,   // free text in the design: 'Palo Alto · Belmont · Remote'
    earliestStart:String,   // free text: 'Within 30 days'
    workSetup:    String,   // free text: 'Hybrid — 3 days onsite'
    compensation: String    // free text: '$210,000 – $240,000'
  },

  // Voluntary self-identification. NEVER returned by any recruiter-facing
  // endpoint. Kept in a subdocument so it can be projected out in one line.
  eeo: {
    provided:   { type: Boolean, default: false },
    gender:     { type: String, default: 'Prefer not to say' },
    veteran:    { type: String, default: 'Prefer not to say' },
    disability: { type: String, default: 'Prefer not to say' }
  },

  experience: [{
    title:  String,
    org:    String,
    period: String,          // free text in the design: 'Mar 2023 — Present'
    loc:    String,
    desc:   String
  }],

  education: [{
    school: String,
    degree: String,
    period: String,          // '2014 — 2018'
    extra:  String           // honors / focus, optional
  }],

  skills: [String],

  visibility: {
    openToOtherRoles: { type: Boolean, default: true }
  },

  settings: {
    twoFactor:  { type: Boolean, default: true },
    language:   { type: String, default: 'English (US)' },
    timezone:   { type: String, default: 'America/Los_Angeles' },  // IANA, not 'Pacific Time (PT)'
    dateFormat: { type: String, enum: ['MM/DD/YYYY', 'DD.MM.YYYY'], default: 'MM/DD/YYYY' },
    pauseNonUrgent: { type: Boolean, default: false },
    digest:     { type: String, enum: ['Off', 'Daily', 'Weekly on Monday'], default: 'Weekly on Monday' },
    // One row per event type, one flag per channel.
    notifications: {
      status:    { email: { type: Boolean, default: true }, sms: { type: Boolean, default: false }, app: { type: Boolean, default: true } },
      interview: { email: { type: Boolean, default: true }, sms: { type: Boolean, default: true  }, app: { type: Boolean, default: true } },
      messages:  { email: { type: Boolean, default: true }, sms: { type: Boolean, default: false }, app: { type: Boolean, default: true } },
      docs:      { email: { type: Boolean, default: true }, sms: { type: Boolean, default: false }, app: { type: Boolean, default: true } },
      matches:   { email: { type: Boolean, default: false }, sms: { type: Boolean, default: false }, app: { type: Boolean, default: true } }
    }
  },

  passwordChangedAt: Date
}, { timestamps: true });

// Virtuals the UI leans on — see README "Identity propagation".
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
userSchema.virtual('initials').get(function () {
  return ((this.firstName?.[0] ?? '?') + (this.lastName?.[0] ?? '')).toUpperCase();
});

export const User = model('User', userSchema);
```

> **`settings.notifications.interview.email` is locked on in the UI.** Enforce it
> server-side too: reject any PATCH that sets it false. The client renders that
> one switch as a non-interactive `accent-locked` track.

---

## `applications`

```js
const applicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },     // 'cc' | 'vp' | 'dx' — stable URL segment

  title: { type: String, required: true },    // 'Senior Software Engineer'
  team:  { type: String, required: true },    // 'Command Center'
  location: String,                           // 'Palo Alto, CA'
  employmentType: String,                     // 'On-site · Full-time'
  reqRef: String,                              // 'SWE-VP-1663' — rendered in mono

  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Submitted', 'Under Review', 'Interview', 'Offer', 'Hired', 'Not Selected', 'Withdrawn']
  },

  appliedAt: { type: Date, required: true },
  closedAt:  Date,                             // set on Not Selected / Withdrawn
  withdrawnAt: Date,

  recruiter: {
    name:     String,
    initials: String,
    role:     String                           // 'Technical Recruiter · Vehicle Platform'
  },
  hiringManager: {
    name: String,
    role: String
  },

  timeline: [{
    at:    { type: Date, required: true },
    title: { type: String, required: true },    // 'Offer extended'
    text:  String,
    tone:  { type: String, enum: ['success', 'active', 'neutral'], default: 'neutral' }
  }],

  documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],

  jobDescriptionUrl: String
}, { timestamps: true });

applicationSchema.index({ user: 1, slug: 1 }, { unique: true });
export const Application = model('Application', applicationSchema);
```

`timeline[].tone` drives the dot color: `success` → `success.DEFAULT`,
`active` → `accent.DEFAULT`, `neutral` → `neutral.dot`.

---

## `interviews`

```js
const interviewSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  slug:        { type: String, required: true },

  kind:   { type: String, enum: ['panel-day', 'single'], default: 'single' },
  status: { type: String, enum: ['Scheduled', 'Reschedule requested', 'Completed', 'Cancelled'], default: 'Scheduled' },

  // For a panel day these bound the whole day; sessions carry their own times.
  startsAt: { type: Date, required: true },
  endsAt:   { type: Date, required: true },

  sessions: [{
    title:    String,                    // 'System design'
    startsAt: Date,
    endsAt:   Date,
    kind:     { type: String, enum: ['session', 'break'], default: 'session' },
    interviewers: [{ name: String, role: String, initials: String }],
    focus:    String
  }],

  format:      { type: String, enum: ['Video', 'Onsite', 'Phone'], default: 'Video' },
  joinUrl:     String,
  // Client reveals joinUrl only inside this window. Server should also refuse
  // to return it earlier — see api-contract.md.
  joinUnlockMinutesBefore: { type: Number, default: 15 },
  dialIn:      String,
  locationNote:String,

  prepChecklist: [{
    label: String,
    done:  { type: Boolean, default: false }
  }],
  resources: [{ label: String, meta: String, url: String }],

  rescheduleRequest: {
    requestedAt: Date,
    reason:      String,
    // Candidate-offered windows, stored as real instants (UTC).
    slots: [{ startsAt: Date, endsAt: Date }]
  }
}, { timestamps: true });

export const Interview = model('Interview', interviewSchema);
```

---

## `documents`

```js
const documentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },      // 'resume' | 'cover' | 'portfolio' | 'cert'

  name:     { type: String, required: true },  // 'Resume_Swaraj_Bangar.pdf'
  kind:     { type: String, enum: ['Resume', 'Cover Letter', 'Portfolio', 'Certification', 'Questionnaire', 'Other'], required: true },
  mimeType: String,
  sizeBytes:Number,                             // format to 'PDF · 842 KB' on the client
  storageKey: String,                           // path/key of the stored file

  uploadedAt: { type: Date, default: Date.now },
  usedFor: [{ type: Schema.Types.ObjectId, ref: 'Application' }],

  // Set when the hiring team asked for this file rather than the candidate
  // volunteering it. Drives the "Requested Documents" tab.
  request: {
    isRequested: { type: Boolean, default: false },
    requestedBy: String,                        // 'Natalie Lara'
    dueAt:       Date,
    fulfilled:   { type: Boolean, default: false },
    note:        String
  },

  deletedAt: Date                               // soft delete
}, { timestamps: true });

export const Document = model('Document', documentSchema);
```

---

## `notifications`

```js
const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },       // 'n0'…'n9'

  kind: { type: String, enum: ['application', 'interview', 'message', 'document'], required: true },
  title: { type: String, required: true },
  body:  String,
  contextLabel: String,                          // 'Software Engineer III — Vehicle Platform'

  createdAt: { type: Date, default: Date.now },  // client groups by recency
  readAt:    Date,
  dismissedAt: Date,

  // Where the CTA goes. Client maps target → route.
  action: {
    label:  String,                              // 'Review offer'
    target: { type: String, enum: ['offer', 'interview-details', 'messages', 'documents', 'application', 'applications', 'overview', ''] },
    targetSlug: String                           // e.g. 'dx' when target is 'application'
  }
});

notificationSchema.index({ user: 1, createdAt: -1 });
export const Notification = model('Notification', notificationSchema);
```

`kind` drives the icon tile: `interview` → `accent.tint` / `#2A55C8` / calendar,
`document` → `warning.bg` / `warning.DEFAULT` / folder, `message` →
`neutral.pill` / `ink.secondary` / chat, `application` → `success.bg` /
`success.DEFAULT` / doc.

---

## `threads` + `messages`

Two collections, since a thread's message list grows unbounded.

```js
const threadSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },        // 'natalie' | 'kevin' | 'panel'

  participant: {
    name:     { type: String, required: true },
    role:     String,                             // 'Technical Recruiter'
    initials: String
  },
  application: { type: Schema.Types.ObjectId, ref: 'Application' },
  lastMessageAt: Date,
  unreadCount:   { type: Number, default: 0 }
}, { timestamps: true });

const messageSchema = new Schema({
  thread: { type: Schema.Types.ObjectId, ref: 'Thread', required: true, index: true },
  fromCandidate: { type: Boolean, required: true },  // true = right-aligned accent bubble
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  attachments: [{ name: String, sizeBytes: Number, storageKey: String }]
});

messageSchema.index({ thread: 1, sentAt: 1 });
export const Thread = model('Thread', threadSchema);
export const Message = model('Message', messageSchema);
```

---

## `offers`

```js
const offerSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },

  stage: { type: String, enum: ['review', 'accepted', 'declined', 'expired'], default: 'review' },

  title: String,                    // 'Software Engineer III'
  team:  String,
  employmentType: String,           // 'Full-time · On-site'
  location: String,
  reportsTo: String,                // 'Dana Whitfield, Engineering Manager'
  contingencies: [String],          // ['Background check', 'Work authorization']

  extendedAt:  Date,
  respondByAt: Date,                // powers the "Respond by" panel

  startDate: {
    proposedByCompany: Date,
    proposedByCandidate: Date,       // set when the candidate counter-proposes
    confirmed: Date
  },

  letter: { name: String, sizeBytes: Number, storageKey: String },

  signature: {
    typedName: String,
    agreedAt:  Date,
    ip:        String                // reasonable to record for an e-signature
  },
  declineReason: String
}, { timestamps: true });

export const Offer = model('Offer', offerSchema);
```

**Signature rule (enforce server-side, not just in the form):** reject the accept
mutation unless `signature.typedName`, trimmed and case-insensitively compared,
equals the user's `fullName`. The client shows
_"Type your name exactly as it appears on your profile."_ on mismatch.

On successful accept: set `offers.stage = 'accepted'` **and**
`applications.status = 'Hired'` in one transaction, and append a timeline entry.

---

## Seed script

`server/src/seed/index.js`, run with `npm run seed`. Wipes and re-inserts, so it
is safe to run repeatedly during development.

Contents: the prototype's own data (see `seed-data.json`, which mirrors the
constants in the design file) **plus two extra candidates** so list views,
pagination and the "no documents yet" empty state can all be exercised:

| Candidate | Purpose |
| --- | --- |
| Swaraj Bangar (`swaraj@example.com`) | The prototype's canonical state — 3 applications, 1 panel day, 3 threads, 4 documents, 1 offer at `review`, 10 notifications |
| Asha Patel (`asha@example.com`) | Fresh account — 0 applications, 0 documents, 0 notifications. Exercises every empty state and the 0% profile-strength bar |
| Miguel Torres (`miguel@example.com`) | 5 applications across all statuses including `Draft` and `Withdrawn`, offer already `accepted` (application `Hired`), all notifications read. Exercises filter chips, the withdrawn-row treatment and the accepted-offer screen |

Password for all three: `portal1234` (bcrypt, 10 rounds). Documented here
because it is throwaway seed data — never ship a default credential.
