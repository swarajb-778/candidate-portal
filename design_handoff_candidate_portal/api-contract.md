# API contract

Express on Node, Mongoose against a MongoDB Atlas cluster. Every screen fetches
through a real HTTP call — nothing is hardcoded in the client. The data behind
those calls is seeded rather than pulled from a live ATS, which is what "static
storage" means here: **the endpoints are real, the corpus is fixed.**

Base URL: `/api/v1`. All responses are JSON. All mutations persist.

## Conventions

- **Auth:** JWT in an `httpOnly`, `sameSite=lax`, `secure` cookie named
  `cp_session`. 30-minute sliding expiry — this is what the Session Expired
  screen exists for. No token ever touches JavaScript, so Axios needs
  `withCredentials: true` and there is no `Authorization` header to manage.
- **Errors:** `{ "error": { "code": "SIGNATURE_MISMATCH", "message": "…", "field": "typedName" } }`.
  `field` lets React Hook Form call `setError(field, …)` directly.
- **Status codes:** `400` validation, `401` no/expired session, `403` forbidden,
  `404` unknown resource, `409` state conflict (e.g. accepting a declined offer),
  `422` semantic failure (signature mismatch).
- **Dates:** ISO 8601 UTC on the wire, always. The client formats in the user's
  `settings.timezone` with `date-fns` + `@date-fns/tz`. The server never sends a
  pre-formatted date string.
- **Never returned to any client:** `passwordHash`, and `user.eeo` on anything
  recruiter-facing. Project them out in the query, not the serializer.

```js
// client/src/lib/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true          // required — the session is a cookie
});

// A 401 anywhere means the session died. Route to /session-expired rather than
// bouncing straight to /login, so the user gets the explanation screen.
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && !location.pathname.startsWith('/login')) {
      window.dispatchEvent(new CustomEvent('session:expired'));
    }
    return Promise.reject(err);
  }
);
```

---

## Auth

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/auth/login` | `{ email, password, remember }` → sets cookie, returns `{ user }`. `401` with `code: 'BAD_CREDENTIALS'` on failure — the design shows one generic message, never "no such user" |
| `POST` | `/auth/signup` | Three-step wizard posts **once**, at the end: `{ firstName, lastName, email, password, city, phone, workAuth, targetRole }`. Returns `{ user }` and sets the cookie — the client lands on `/overview` already authenticated |
| `POST` | `/auth/logout` | Clears the cookie. `204` |
| `POST` | `/auth/forgot-password` | `{ email }` → always `204`, whether or not the address exists. The design's "check your inbox" screen must not leak account existence |
| `GET` | `/auth/me` | Current user, or `401`. This is the app's session probe on boot |
| `POST` | `/auth/sso/:provider` | `provider` ∈ `google` \| `linkedin`. Stubbed in seed mode: signs in the seeded Swaraj account and returns `{ user }`. Keep the endpoint real so the buttons aren't decoration |

---

## Profile

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/me/profile` | Full profile including `experience`, `education`, `skills`, `eeo`, computed `profileStrength` |
| `PATCH` | `/me/profile` | Partial. The design edits **per section**, so send only that section's fields: `{ firstName, lastName, email, phone, city, pronouns }` or `{ links: {…} }` or `{ preferences: {…} }` |
| `PATCH` | `/me/profile/eeo` | `{ gender, veteran, disability }` → sets `eeo.provided = true`. Separate endpoint so it can be audit-logged and access-controlled independently |
| `POST` | `/me/profile/experience` | Append. Returns the created subdocument with its `_id` |
| `PATCH` | `/me/profile/experience/:id` | Update one position |
| `DELETE` | `/me/profile/experience/:id` | Remove one position |
| `POST` / `PATCH` / `DELETE` | `/me/profile/education[/:id]` | Same shape as experience |
| `PUT` | `/me/profile/skills` | `{ skills: string[] }` — replace the whole array. Chip add/remove is a full replace; simpler than per-chip endpoints and the array is tiny |
| `PATCH` | `/me/visibility` | `{ openToOtherRoles: boolean }` |
| `GET` | `/me/profile/recruiter-view` | What the "Preview as recruiter" modal renders. **Must** omit `eeo` and `preferences.compensation` — the modal's own footnote promises this, so make the endpoint the thing that guarantees it rather than trusting the client to hide fields |

`profileStrength` is computed server-side so client and server can never
disagree. Eight boolean checks, `Math.round(done / 8 * 100)`:

```js
[
  Boolean(u.email && u.phone && u.city),        // Personal information
  hasResume,                                    // Resume uploaded
  Boolean(u.links?.linkedin && u.links?.github),// Links & profiles
  u.experience.length > 0,                      // Work experience
  u.education.length > 0,                       // Education
  u.skills.length >= 5,                         // Skills (5 or more)
  Boolean(u.preferences?.targetRole),           // Job preferences
  u.eeo.provided                                // Self-identification
]
```

---

## Applications

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/applications` | `?status=Interview,Offer&sort=recent\|oldest\|title` — the filter chips and sort dropdown. Returns the list plus `{ counts: { all, active, offer, closed } }` for the chip badges |
| `GET` | `/applications/:slug` | Detail: timeline, documents, recruiter, hiring manager. Populates the five-tab view |
| `POST` | `/applications/:slug/withdraw` | `{ reason? }`. `409` if already closed. Sets `status: 'Withdrawn'`, `withdrawnAt`, appends a timeline entry, and cancels any `Scheduled` interviews on that application — the confirmation copy promises all three, so do all three in one transaction |

Withdrawn applications **stay in the list response**. The design greys the row
and shows the reason rather than removing it; a client-side filter would be the
wrong fix.

---

## Interviews

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/interviews` | `?tab=upcoming\|past`. Panel days come back as one interview with a `sessions[]` array — do not flatten to one interview per session, the UI groups them |
| `GET` | `/interviews/:slug` | Detail with `sessions`, `interviewers`, `prepChecklist`, `resources` |
| `PATCH` | `/interviews/:slug/prep/:itemId` | `{ done: boolean }` — the prep checklist ticks persist |
| `POST` | `/interviews/:slug/reschedule` | `{ reason?, slots: [{ startsAt, endsAt }] }`, ISO UTC. Sets `status: 'Reschedule requested'`. Original time stays on the calendar until recruiting confirms — the success copy says so, so don't clear `startsAt` |
| `GET` | `/interviews/:slug/join` | Returns `{ joinUrl }` **only** inside the unlock window, else `403` with `code: 'TOO_EARLY'` and `{ unlocksAt }`. The 15-minute rule is a real access control, not a hidden button |

### Availability

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/availability/request` | The open request: `{ interviewSlug, dueAt, windowStart, windowEnd, timezone }`. **The calendar's selectable range comes from here** — never hardcode it in the client, that is exactly how the prototype ended up offering September dates for an August deadline |
| `GET` | `/availability/slots?date=2026-08-27` | `{ slots: [{ startsAt, endsAt, taken: boolean }] }` in UTC. `taken` greys the chip. The client converts to the chosen zone and rolls the date forward when a conversion crosses midnight |
| `POST` | `/availability` | `{ slots: [{ startsAt, endsAt }], note? }` → `201`. Marks the request fulfilled and notifies recruiting |

---

## Documents

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/documents` | `?tab=mine\|requested`. Requested tab returns unfulfilled `request.isRequested` docs with `requestedBy` and `dueAt` |
| `POST` | `/documents` | `multipart/form-data`: `file`, `kind`, `applicationSlug?`. `413` over 10 MB, `415` on a type outside PDF/DOC/DOCX/PNG/JPG. Both map to the upload modal's error state |
| `PUT` | `/documents/:slug` | Replace the file, keep the slug and its `usedFor` links |
| `DELETE` | `/documents/:slug` | Soft delete — sets `deletedAt`. Returns `204` |
| `GET` | `/documents/:slug/download` | Streams the file with `Content-Disposition: attachment` |
| `GET` | `/documents/:slug/preview` | First page as an image, or the PDF inline. Backs the preview modal |

Upload progress in the modal is Axios's `onUploadProgress` — a real number, not
a simulated timer as in the prototype:

```js
api.post('/documents', form, {
  onUploadProgress: e => setPct(Math.round((e.loaded / e.total) * 100))
});
```

---

## Messages

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/threads` | List with `participant`, `lastMessageAt`, `unreadCount`, linked application |
| `GET` | `/threads/:slug/messages` | `?before=<iso>&limit=50`, oldest-first within a page. Client groups by calendar day into the date separators |
| `POST` | `/threads/:slug/messages` | `{ body }` or multipart with `attachments[]`. Returns the created message. Optimistic-update this one — the composer should feel instant |
| `POST` | `/threads/:slug/read` | Zeroes `unreadCount`. Fire on thread open |

---

## Notifications

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/notifications` | `?filter=all\|unread\|interview\|message\|document\|application`. Returns items plus `{ unreadCount }`. The header bell badge and the page share this one query |
| `POST` | `/notifications/read-all` | Marks everything read. `204` |
| `POST` | `/notifications/:slug/read` | One item — fired when its CTA is clicked |
| `DELETE` | `/notifications/:slug` | Dismiss (sets `dismissedAt`) |

The bell dropdown shows the first four of the same list. One query key, two
consumers — do not add a separate "recent notifications" endpoint.

---

## Offer

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/offers/:applicationSlug` | Full offer. `404` if the application has no offer |
| `PATCH` | `/offers/:applicationSlug/start-date` | `{ proposedByCandidate: '2026-10-12' }`. Must be a Monday inside the allowed window, else `400`. Company's date stays authoritative until recruiting confirms |
| `POST` | `/offers/:applicationSlug/accept` | `{ typedName, agreed: true }`. `422 SIGNATURE_MISMATCH` if the name doesn't match `fullName`; `400` if `agreed` is false; `409` if already resolved. On success sets `stage: 'accepted'`, `application.status: 'Hired'`, appends a timeline entry |
| `POST` | `/offers/:applicationSlug/decline` | `{ reason? }`. Sets `stage: 'declined'`, closes the application |
| `GET` | `/offers/:applicationSlug/letter` | Streams the offer letter PDF |

---

## Settings

| Method | Path | Notes |
| --- | --- | --- |
| `PATCH` | `/me/settings` | Partial: `{ language, timezone, dateFormat, pauseNonUrgent, digest }` |
| `PATCH` | `/me/settings/notifications` | `{ status: { sms: true } }` — deep partial. **Rejects** `interview.email: false` with `400 CHANNEL_LOCKED` |
| `POST` | `/me/password` | `{ current, next }`. `422 WRONG_PASSWORD` on a bad current; `400` if `next` fails the rule (8+ chars, at least one digit). Current session survives, others are revoked |
| `PATCH` | `/me/two-factor` | `{ enabled: boolean }` |
| `GET` | `/me/sessions` | Signed-in devices with `current: true` on the caller's own |
| `DELETE` | `/me/sessions/:id` | Revoke one. `403` on your own — the UI hides that button, the server should still refuse |
| `POST` | `/me/export` | `202` + `{ jobId }`. Poll `GET /me/export/:jobId` for `{ state: 'pending'\|'ready', url?, sizeBytes?, expiresAt? }`. This is why the card has a preparing state |
| `DELETE` | `/me` | `{ confirmation: 'DELETE' }`. Withdraws open applications, cancels interviews, anonymises retained records, clears the cookie. `400` unless the confirmation string matches exactly |

---

## TanStack Query keys

One key per resource shape. Keep them in a single module so invalidation is
grep-able.

```js
// client/src/lib/queryKeys.js
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
```

Invalidation map for the mutations that touch more than one screen:

| Mutation | Invalidate |
| --- | --- |
| withdraw application | `applications`, `application(slug)`, `interviews`, `notifications` |
| accept / decline offer | `offer(slug)`, `application(slug)`, `applications`, `notifications` |
| submit availability | `availabilityRequest`, `interviews`, `notifications` |
| request reschedule | `interview(slug)`, `interviews`, `notifications` |
| upload / delete document | `documents(*)`, `profile` (strength), `application(slug)` |
| any profile PATCH | `profile`, `me` (the chrome's name and initials read from `me`) |
| notification read / read-all | `notifications(*)` |

That last row matters: the sidebar avatar, header name and Overview greeting all
derive from `me`, so a profile edit must invalidate it or the chrome goes stale —
this was a real bug in the prototype.
