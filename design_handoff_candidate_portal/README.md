# Handoff: Rivian &amp; VW Tech Candidate Portal

## Overview

A candidate-facing hiring portal. A job applicant signs in and sees everywhere
their applications stand: status and timeline per application, scheduled
interviews with prep material, threads with recruiters, uploaded and requested
documents, an offer they can review and sign, and a profile that carries across
every application.

Sixteen routes, nine modals, fully responsive. The design is complete and
verified — there are no open design questions.

---

## About the design files

**The files in `design-reference/` are design references written in HTML.** They
are a working prototype showing intended look and behavior. They are not
production code and should not be copied into the app.

The task is to **recreate these designs in the target codebase** using its own
patterns and libraries — React components, Tailwind classes, real routing, real
data. The prototype uses inline styles and a single-file component model that
exist only to make the mockup self-contained; none of that should survive into
the app.

Open `design-reference/Candidate Portal App.dc.html` in a browser to click
through every screen and modal. `screenshots/` has a still of each state, in the
order they appear below.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, radii, states, and copy.
Recreate the UI pixel-perfectly. Every value is tokenised in
`tailwind.config.js` — use the token names, don't re-derive the values.

Two deliberate exceptions where the prototype is *deliberately* wrong and the
real build should differ:

1. **Timezone conversion.** The prototype uses a hardcoded minute-offset table
   (`ZONE_OFFSET`). Use IANA zones via `date-fns` + `@date-fns/tz` so DST is
   correct.
2. **Upload progress.** The prototype animates a fake percentage on a timer. Use
   the real Axios `onUploadProgress` value.

Both are called out again at their point of use.

---

## Target stack

| Layer | Choice |
| --- | --- |
| Client | React 18, Vite |
| Routing | **`react-router` v7** (the `react-router` package, not `react-router-dom`) |
| Styling | Tailwind CSS 3.4 with the theme in `tailwind.config.js` |
| Server state | TanStack Query v5 |
| Client state | Redux Toolkit |
| HTTP | Axios (`withCredentials: true`) |
| Forms | React Hook Form + zod resolver |
| Icons | `lucide-react` |
| API | Express on Node |
| DB | MongoDB Atlas cluster via Mongoose |

### Additions beyond the base stack — all approved

| Package | Why it's here |
| --- | --- |
| Tailwind token theme (`tailwind.config.js`) | Ships in this bundle. Without it, hexes get hand-typed and the design drifts within a sprint |
| `@fontsource-variable/geist`, `@fontsource/geist-mono` | The design is Geist throughout. Self-hosting beats a Google Fonts request on every load |
| `@radix-ui/react-{dialog,dropdown-menu,tabs,switch,accordion,select}` | There are 9 modals, 3 dropdowns, 4 tab sets, 12 switches, 1 accordion. The prototype hand-rolled focus traps and Escape handling; Radix gets that right. Unstyled, so the pixels stay yours |
| `date-fns`, `@date-fns/tz` | Correct timezone math for the availability calendar. See "Availability calendar" |
| `zod`, `@hookform/resolvers` | The validation rules express cleanly as schemas and are then shared with the server |
| `clsx`, `tailwind-merge` | The standard `cn()` helper for conditional classes |

**Deliberately not used:** `@tailwindcss/forms`. It restyles inputs and fights
the design's specific 42px height / 9px radius / `line-control` border.

Optional, your call, not assumed anywhere below: `react-day-picker` (the
calendar is simple enough to hand-roll), `sonner` (the toast is one component),
Storybook (useful for holding the design stable over time).

### `cn()` helper

```js
// client/src/lib/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs) => twMerge(clsx(inputs));
```

---

## Repo layout

Single repo, two workspaces. Shared zod schemas are the reason — the same
validation runs on both sides, and a monorepo makes that a plain import rather
than a published package.

```
candidate-portal/
├── package.json               # npm workspaces: client, server, shared
├── shared/
│   └── schemas/               # zod schemas imported by BOTH sides
│       ├── auth.js            #   login, signup
│       ├── profile.js         #   profile sections, experience, education
│       ├── offer.js           #   signature, start date
│       └── settings.js        #   password, notification channels
├── client/
│   ├── index.html
│   ├── tailwind.config.js     # ← from this bundle
│   ├── vite.config.js         # proxy /api → localhost:4000
│   └── src/
│       ├── main.jsx
│       ├── routes.jsx         # createBrowserRouter tree
│       ├── lib/
│       │   ├── api.js         # axios instance + 401 interceptor
│       │   ├── queryKeys.js   # see api-contract.md
│       │   ├── cn.js
│       │   └── datetime.js    # zone conversion, date formatting
│       ├── store/             # Redux Toolkit
│       │   ├── index.js
│       │   └── slices/{ui,filters,drafts}.js
│       ├── components/
│       │   ├── primitives/    # Button, Card, Badge, Switch, Field, Tabs, Modal, Toast
│       │   ├── chrome/        # Sidebar, TopBar, MobileTabBar, NavDrawer, NotifBell, UserMenu
│       │   └── shared/        # StatusPill, Timeline, DocRow, EmptyState, SectionCard
│       ├── features/          # one folder per screen — see "Screens"
│       └── styles/index.css   # @tailwind directives + the 5 global rules below
└── server/
    └── src/
        ├── index.js
        ├── db.js
        ├── middleware/{auth,error,upload}.js
        ├── models/            # see data-models.md
        ├── routes/            # see api-contract.md
        └── seed/index.js      # npm run seed
```

---

## Design tokens

All of these are in `tailwind.config.js`. This table is the reference; the config
is the source of truth.

### Color

| Token | Hex | Used for |
| --- | --- | --- |
| `ink` | `#0F1B2D` | Primary text, dark avatar fill, toast background, login context panel |
| `ink-secondary` | `#5A6675` | Supporting copy, inactive nav labels |
| `ink-muted` | `#8A94A3` | Meta lines, timestamps, helper text |
| `ink-subtle` | `#A9B4C2` | Dismiss glyphs |
| `ink-disabled` | `#C4CFDD` | Disabled calendar dates, disabled month arrows |
| `ink-chip` | `#334155` | Skill chip text, consent copy |
| `ink-slate` | `#7B8794` | Neutral pill text, dropdown meta |
| `accent` | `#3A6FF7` | Primary buttons, links, active nav, focus border, selected states |
| `accent-hover` | `#2A55C8` | Primary button hover, link hover, strong accent text |
| `accent-disabled` | `#AFC3EE` | Primary button, disabled |
| `accent-tint` | `#EEF3FE` | Icon tiles, soft informational pills |
| `accent-tintStrong` | `#DCE6FB` | Unread notification card border |
| `accent-wash` | `#F5F8FF` | Selected-slot summary panel |
| `accent-row` | `#F8FAFF` | Unread notification row background |
| `accent-locked` | `#C9D8F8` | The one always-on switch track |
| `surface-page` | `#F7F9FC` | App background |
| `surface-card` | `#FFFFFF` | All cards, modals, top bar, sidebar |
| `surface-sunken` | `#FAFBFD` | Disabled cells, muted banner, upload dropzone |
| `surface-hover` | `#F6F8FB` | Default control hover |
| `surface-hoverAlt` | `#F4F7FB` | Menu item hover |
| `surface-hoverSoft` | `#F8FAFC` | Accordion row hover |
| `surface-preview` | `#EDF1F6` | Document-preview desk |
| `line-card` | `#E7ECF2` | Card border — 1px, always |
| `line-inner` | `#EEF1F6` | Divider inside a card |
| `line-list` | `#F2F5F9` | Row divider in a list |
| `line-input` | `#DDE3EB` | Textarea / search border |
| `line-control` | `#D9E0EA` | Secondary button, input border |
| `line-controlHover` | `#C4CFDD` | Secondary button hover border |
| `line-menu` | `#E4E9F0` | Dropdown panel border |
| `line-chip` | `#E1E7EF` | Skill chip border |
| `success` | `#1E7A46` | Offer/Hired pill text, checkmarks, success copy |
| `success-bg` | `#E8F3EC` | Offer/Hired pill fill, success icon tile |
| `success-bgAlt` | `#F1F8F3` | Accepted-offer banner, success inline notice |
| `success-border` | `#CFE6D8` | Success banner border |
| `success-text` | `#33604A` | Body copy on a success banner |
| `warning` | `#B26A00` | "Respond by" label, document-request icon |
| `warning-bg` | `#FFF6E8` | Warning icon tile, respond-by panel |
| `warning-bgAlt` | `#FFFBF3` | 2FA-off notice |
| `warning-border` | `#F2DFB8` | Warning panel border |
| `warning-text` | `#8A5A00` | Body copy on a warning panel |
| `danger` | `#B4231C` | Destructive buttons, error text, remove links |
| `danger-hover` | `#96201A` | Destructive button hover |
| `danger-bg` | `#FDF6F5` | Destructive callout fill |
| `danger-bgAlt` | `#FDF3F2` | Destructive ghost-button hover |
| `danger-border` | `#F0D8D5` | Destructive callout border |
| `danger-text` | `#7A2E29` | Body copy on a destructive callout |
| `danger-disabled` | `#E0A9A5` | Delete button before confirmation is typed |
| `neutral-pill` | `#F1F4F8` | Neutral chip fill, file icon tile |
| `neutral-track` | `#CBD3DE` | Switch, off |
| `neutral-dot` | `#C9D3E0` | Inactive timeline dot |
| `neutral-bar` | `#EDF1F6` | Progress bar track |
| `scrim` | `rgba(15,27,45,.44)` | Modal overlay |
| `scrim-strong` | `rgba(15,27,45,.52)` | Document-preview overlay |
| Selection | `rgba(58,111,247,.18)` | `::selection` |

There are no gradients. There is no dark mode.

### Typography

Geist 300/400/500/600/700, Geist Mono 400/500.

| Token | Spec | Used for |
| --- | --- | --- |
| `auth-title` | 600 · 27px · 1.2 · −0.018em | Login and sign-up headings |
| `page-title` | 600 · `clamp(21px,2.4vw,25px)` · 1.2 · −0.018em | Screen `h1`. Overview alone uses `clamp(21px,2.4vw,26px)` |
| `modal-title` | 600 · `clamp(18px,2.2vw,20px)` · 1.25 · −0.015em | Modal `h2`. The success/expired modals use a flat 20px |
| `value-lg` | 600 · 19px · 1.25 · −0.012em | Profile name in its card |
| `value` | 600 · 17px · 1.3 · −0.01em | Offer start date |
| `card-title` | 600 · 15.5px · 1.3 | Every card `h2`, banner headings |
| `item` | 600 · 14.5px · 1.35 | List item titles, timeline entries, notification titles |
| `body-lg` | 400 · 14px · 1.5 | Screen subtitles |
| `body` | 400 · 13.5px · 1.55 | Body copy. 500 weight for field values |
| `body-sm` | 400 · 13px · 1.55 | Dense body, banner copy |
| `label-lg` | 500 · 12.5px · 1 | Form labels, small button text |
| `label` | 500 · 12px · 1 | Compact form labels |
| `meta-lg` | 400 · 12.5px · 1.45 | Meta lines |
| `meta` | 400 · 12px · 1.4 | File sizes, dates |
| `meta-xs` | 400 · 11.5px · 1.4 | Densest meta |
| `overline` | 500 · 11px · 1 · 0.06em · UPPERCASE | Field labels in read mode |
| `overline-sm` | 500 · 10.5px · 1 · 0.05em · UPPERCASE | Table column heads, weekday heads |
| `pill` | 600 · 10.5px · 1 · 0.07em · UPPERCASE | Status pills |
| `timeline-date` | **Mono** 500 · 10.5px · 1 · 0.08em | Timeline dates (`AUG 25`) |
| Req ref | **Mono** 400 · 11.5px | Requisition codes (`SWE-VP-1663`) |

Button text: `600 13.5px/1` primary large, `600 13px/1` primary, `500 13px/1`
secondary, `500 12.5px/1` small.

Numbers, dates, and reference codes render in **Geist Mono**. Body text never
does.

### Spacing, radii, sizing

- **Card padding** `clamp(18px, 2vw, 22px)` · **modal padding** `clamp(22px, 3vw, 28px)`
- **Gap between stacked cards** 14px · **after a page header** 20px · **between column groups** `clamp(14px, 1.8vw, 22px)`
- **Radii** 5px tag · 7px menu item · 8px icon button · 9px input/control · 10px button/callout · 11px menu · 12px card · 14px modal · 99px pill · 50% circle
- **Control heights** 32 / 34 / 36 / 38 / 40 / 42 (form field) / 44 (tab, primary) / 46 (modal button) / 48 (auth field) px
- **Mobile tab bar** 66px fixed · **switch** 42×24px with an 18px knob at 3px inset (`left: 21px` when on)
- **Content max-widths** Help 680 · Offer 820 · Notifications 860 · Settings/detail 880 · Documents 960 · Profile 1180 px

### Shadows

| Token | Value |
| --- | --- |
| `shadow-modal` | `0 24px 60px -16px rgba(15,27,45,.45)` |
| `shadow-menu` | `0 12px 32px -10px rgba(15,27,45,.22), 0 2px 6px rgba(15,27,45,.06)` |
| `shadow-menu-sm` | `0 12px 30px -10px rgba(15,27,45,.22)` |
| `shadow-toast` | `0 14px 34px -12px rgba(15,27,45,.5)` |
| `shadow-float` | `0 20px 50px -24px rgba(15,27,45,.28)` |
| `shadow-paper` | `0 6px 20px -8px rgba(15,27,45,.25)` |
| `shadow-knob` | `0 1px 3px rgba(15,27,45,.3)` |
| `shadow-focus` | `0 0 0 3px rgba(58,111,247,.14)` |

Cards carry **no** shadow — a 1px `line-card` border does the work. Shadows
appear only on things that float.

### Motion

Four durations, nothing else:

| Duration | Applies to |
| --- | --- |
| 150ms | `background`, `border-color`, `color` on hover/press |
| 180ms | Switch knob `left` and track `background` |
| 300ms ease | Progress bar `width` |
| 700ms linear infinite | The one spinner (`@keyframes spin`) |

No entrance animations, no scroll reveals, no parallax. Respect
`prefers-reduced-motion` by dropping all four to `0ms`.

### Global CSS

The only five rules that aren't Tailwind utilities:

```css
@import '@fontsource-variable/geist';
@import '@fontsource/geist-mono';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-surface-page font-sans text-ink antialiased; }
  a    { @apply text-accent hover:text-accent-hover; }
  ::selection { background: rgba(58,111,247,.18); }
}
@keyframes spin { to { transform: rotate(360deg); } }
```

---

## Global chrome

### Sidebar — `app:` and up

Fixed left column, 232px, `surface-card`, right border `line-card`, full height,
**scrolls internally** (`overflow-y: auto`) rather than clipping.

- **Nav items** 40px tall, 10px horizontal padding, `rounded-control`, 11px gap
  between a 18px `lucide-react` icon and a `500 13px` label.
  - Active: `bg-accent-tint`, `text-accent-hover`, icon inherits.
  - Inactive: `text-ink-secondary`; hover `bg-surface-hover`, `text-ink`.
  - Messages carries a badge: 18px circle, `bg-accent`, white `600 10px`.
- Order: Overview · My Applications · Interviews · Messages · Documents ·
  Profile · Settings.
- **Footer** pinned below the list, separated by `line-inner`: a `500 12px ink`
  "Need help?" heading, then two quiet `body-sm ink-secondary` links —
  "Candidate FAQ" and "Contact Recruiting" (which routes to Messages) — then a
  full-width 40px `rounded-button` `line-control` "Help Center" button.

### Top bar

64px, `surface-card`, bottom border `line-card`, sticky.

- **Left: the wordmark**, not a logo file — `600 12px` `ink` "RIVIAN &amp; VW
  TECH" with 0.04em tracking, a `line-card` vertical rule, then
  `400 13px ink-secondary` "Candidate Portal". Below `app:`, a hamburger sits to
  its left opening the nav drawer.
- Right: notification bell, then the user menu.
- **Bell**: 40px `rounded-button` ghost button, 18px icon. The unread **count**
  renders in a 17px `bg-accent` circle at the top-right in white `600 9.5px` —
  a number, not a dot. Opens a 348px dropdown, `rounded-card`, `shadow-menu`,
  `line-menu` border: a header row with `600 13px` "Notifications" and a
  "Mark all as read" `accent` ghost link, then **the first four items from
  `GET /notifications`** — unread rows get `bg-accent-row` and a kind-colored 7px
  dot, read rows get `neutral-dot` — then a full-width 44px footer button
  "View all notifications" in `accent` routing to `/notifications`.
- **User menu**: 40px pill, `line-card` border, containing a 30px `bg-ink`
  circle with the user's **initials** and, on `app:` and up, the **full name**
  plus a chevron. Opens a 238px dropdown: name + email header, then Profile,
  Settings, Help, and Sign out (`danger`, separated by `line-inner`).

> **Initials and name come from the authenticated user**, derived from
> `firstName`/`lastName`. Never hardcode them — see "Identity propagation".

### Mobile — below `app:`

- Sidebar becomes a left drawer over a `scrim`, same item styling, closing on
  navigation or overlay tap.
- Fixed **bottom tab bar**, 66px, `surface-card`, top border `line-card`, five
  equal columns: Overview · Applications · Interviews · Messages · More.
  Icon 18px above a `500 10px` label; active is `accent`, inactive
  `ink-secondary`. Messages shows a 16px count badge.
- **"More" opens a sheet** listing Documents, Profile, Settings, Notifications,
  Help. (The prototype shortcuts straight to Settings — build the sheet.)
- Main content gets `pb-[82px]` so the bar never covers the last card.

---

## Screens

Sixteen routes. Each entry gives the route, what the user does, the layout, and
the components with their tokens. Copy is given verbatim where it is fixed —
**use it as written**; it has been reviewed.

```jsx
// client/src/routes.jsx — react-router v7
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  { path: '/login',            element: <LoginScreen /> },       // + ?view=forgot|sent
  { path: '/signup',           element: <SignupWizard /> },
  { path: '/session-expired',  element: <SessionExpired /> },
  {
    element: <AppShell />,                                        // sidebar + topbar + tabbar
    children: [
      { index: true,                     element: <Overview /> },
      { path: 'applications',            element: <Applications /> },
      { path: 'applications/:slug',      element: <ApplicationDetail /> },
      { path: 'applications/:slug/offer',element: <Offer /> },
      { path: 'interviews',              element: <Interviews /> },
      { path: 'interviews/:slug',        element: <InterviewDetail /> },
      { path: 'messages',                element: <Messages /> },
      { path: 'messages/:slug',          element: <Messages /> },  // mobile thread view
      { path: 'documents',               element: <Documents /> },
      { path: 'profile',                 element: <Profile /> },
      { path: 'settings',                element: <Settings /> },  // + ?tab=
      { path: 'notifications',           element: <Notifications /> },
      { path: 'help',                    element: <Help /> },
      { path: '*',                       element: <NotFound /> }
    ]
  }
]);
```

---

### 1. Login — `/login`

**Purpose:** authenticate, or start a new account.

**Layout:** full-viewport flex, wrapping. Two panels.

- **Left, `bg-ink`, `flex: 1 1 46%`, min 320px, padding `clamp(32px,5vw,64px)`.**
  A very subtle radial lift sits in the top-right corner
  (`radial-gradient` of `rgba(58,111,247,.16)` fading to transparent) — the one
  gradient in the product. Contains, top to bottom: `600 12px` white
  "RIVIAN &amp; VW TECH" at 0.04em over a 2px 28px-wide `accent` rule, then
  `400 13px rgba(255,255,255,.62)` "Candidate Portal"; the headline
  "One place for every step of your application." in white `auth-title`; then a
  bordered panel (`rgba(255,255,255,.07)` border, `rounded-card`) with three
  rows divided by the same hairline, each a 7px dot beside
  `400 13px/1.5 rgba(255,255,255,.78)` copy:

  | Dot | Copy |
  | --- | --- |
  | `accent` | Track each application by stage |
  | `#E0A33A` | See what needs your action, and when |
  | `#3EA76B` | Interview details, documents and messages |

  Pinned at the bottom, `400 11.5px/1.5 rgba(255,255,255,.38)`: "Unofficial
  candidate portal concept created for demonstration purposes." Keep this line —
  it matters for a portal that names real companies.

  The whole panel is hidden below `app:` — mobile gets the form only.
- **Right, `surface-card`, `flex: 1 1 54%`.** A 400px max-width form block,
  centered, padding `clamp(28px,5vw,56px)`. Heading `auth-title` "Welcome back",
  sub `body-lg ink-secondary` "Access your candidate portal."

**Form:** email and password fields — 48px, `rounded-button`, `line-control`
border, `400 14px` text, label `label-lg` `ink-chip` 7px above. The password
label row carries a right-aligned `500 12px accent` **"Show"** toggle that flips
the input type and the label to "Hide". Focus: `accent` border +
`shadow-focus`. Below the fields, a row with a "Remember me" checkbox (16px,
`accent-color`) and a "Forgot password?" `accent` ghost link. Primary submit is
full-width 48px `bg-accent` `rounded-button` `600 14px` white, hover
`accent-hover`.

**Validation** (zod, `shared/schemas/auth.js`): email must be a valid address;
password non-empty. A failed sign-in shows one inline row above the button — a
15px `danger` circle with a white `!`, then `400 12.5px danger` copy. Use the
same generic message for bad email and bad password.

**SSO:** an "or continue with" divider (a `line-card` rule either side of
`meta ink-muted` text), then **two** 44px `rounded-button` `line-control`
buttons side by side in a `flex` row with a 10px gap — **Google** and
**LinkedIn** — each an 18px mark plus `500 13px` label, hover `surface-hover`.
(Two providers, not three. `showSocialAuth` in the prototype hides the whole
block; ship it visible.)

**Footer:** `body-sm ink-secondary` — "New here? **Create an account**" where the
link is an `accent` button routing to `/signup`.

**Two sub-views on the same route**, `?view=`:

- `forgot` — heading "Reset your password", one email field, "Send reset link"
  primary, "Back to sign in" ghost.
- `sent` — a 42px `success-bg` circle with a `success` check, heading
  "Check your inbox", body naming the address, and a "Back to sign in" primary.

---

### 2. Sign-up — `/signup`

**Purpose:** create an account in three steps. Posts once, at the end.

Renders in the same two-panel shell as Login.

**Step indicator:** three equal columns, 8px gap. Each is a 4px `rounded-full`
bar over an `11.5px` label. Reached steps get `bg-accent` and `ink`; unreached
get `bg-neutral-knob` and `ink-faint`. The current step's label is 600.

**Step 1 — Account.** Heading "Create your account", sub "One account covers
every role you apply to at Rivian &amp; VW Tech." Fields: First name and Last
name side by side (`flex-1 1 130px` each), then Email, then Password
(placeholder "At least 8 characters"). Then a consent checkbox with
`400 12.5px/1.55 ink-secondary` copy: "I agree to the candidate privacy notice
and to being contacted about my applications."

**Step 2 — Profile.** Heading "A few basics", sub "These carry over to every
application, so you only enter them once." Fields: Location, Phone, Work
authorization (select: US Citizen / Permanent Resident / Visa holder / Need
sponsorship), and "What kind of role are you after?".

**Step 3 — Resume.** Heading "Add your resume", sub "Optional now, required
before you submit an application." Empty state is a full-width dashed dropzone
— `border-dashed line-controlHover`, `rounded-card`, `bg-surface-sunken`, 34px
vertical padding, centered: a 40px `accent-tint` circle with an `accent` upload
icon, `500 13.5px` "Choose a file", `meta-lg ink-muted` "PDF or DOCX · up to
10 MB". Hover brightens the border to `accent` and the fill to `accent-wash`.
Once attached, it becomes a `success-bgAlt` row with a `success` check circle,
the filename, size, and a "Remove" button.

**Footer:** a "Cancel"/"Back" secondary and a primary reading "Continue" on
steps 1–2 and "Finish and enter portal" on step 3. Below: "Already have an
account? **Sign in**".

**Validation per step** — do not let the user advance past a bad step:

| Step | Rule | Message |
| --- | --- | --- |
| 1 | First and last name non-empty | "Enter your first and last name." |
| 1 | Valid email | "Enter a valid email address." |
| 1 | Password ≥ 8 chars | "Password needs at least 8 characters." |
| 1 | Consent checked | "Accept the privacy notice to continue." |
| 2 | Location non-empty | "Add a location so we can match you to roles." |
| 3 | — | Resume genuinely optional |

On finish, `POST /auth/signup` with the accumulated values, then navigate to `/`.
**The new user's name must immediately drive the chrome** — greeting, header
name, and both avatars.

---

### 3. Overview — `/`

**Purpose:** what needs attention today.

Header: `page-title` greeting `Hi {firstName} 👋` (the one emoji in the product —
keep it), `body-lg ink-secondary` sub "Welcome to your candidate portal. Here's
the latest on your applications.", and below that a `meta-lg ink-muted`
"Last updated: {timestamp}" line.

> The prototype also shows a `LAYOUT` switch (Action-first / Metrics-first) — a
> `overline-sm ink-muted` label beside a two-button segmented control. **Do not
> build it.** It was a design exploration for comparing hierarchies; ship
> action-first only, and drop the control.

Below, a single column of cards, 14px gaps, max-width 1180px.

**Action card — `warning`-toned, shown only while an availability request is
open.** `bg-warning-bgAlt`, `border-warning-border`, `rounded-card`. An
`overline` row of a 15px `warning` alert glyph and "ACTION REQUIRED", then
`card-title` "Complete interview availability", then the role in `body-sm`, then
`meta-lg warning-text` "Requested by Recruiting · Due {date}". Right side: a
primary "Submit availability" opening the calendar modal, with `meta ink-muted`
"Takes about 2 minutes" beneath it. Once submitted it collapses to a
`success-bgAlt` confirmation row.

**Next interview card.** `surface-card`. `overline ink-muted` "NEXT INTERVIEW",
then the role `item`, then the day and window, then the session count. Right
side: "View interview details" secondary, "Add to calendar" ghost, and
"Request reschedule" ghost. If the join window is open, a primary "Join
interview" leads. A "Hide sessions" / "Session list" ghost toggles the
itinerary inline.

**My Applications card.** `card-title` "My Applications" with a "View all →"
ghost link. Three rows, `line-list` dividers: role `item`, team `body-sm`, then
a `meta` line joining location · setup · type · "Applied {date}", a
right-aligned `StatusPill`, a three-segment stage bar, and a
"View application →" secondary.

> **Pill copy on Overview is the stage, not the status enum** — the Command
> Center row reads `PANEL INTERVIEW`, not `INTERVIEW`. Derive the label from the
> most recent timeline entry where one exists; fall back to the status.

**Recent messages.** `card-title` "Messages" with "View all →". Two rows: 34px
`accent-tint` initials circle, name + `meta` role, one-line truncated preview,
`meta-xs` date, and a 7px `accent` unread dot.

---

### 4. My Applications — `/applications`

**Purpose:** every application, filterable.

Header `page-title` "My Applications" + count sub. Right: a sort dropdown
(Most recent / Oldest / Role A–Z) as a 40px `rounded-button` `line-control`
button opening a `shadow-menu` panel.

**Filter chips**, 8px gap, wrapping: All · Active · Interview · Offer · Closed.
Active chip is `bg-ink` white `500 12.5px`; inactive is `surface-card` with a
`line-control` border and `ink-secondary`. Counts append as `· 3`.

**Rows** — `surface-card`, `line-card`, `rounded-card`, 19–20px padding, 16px
gaps, wrapping:

- Top: role `item`, team + location + "Applied {date}" `meta`, right-aligned
  `StatusPill`.
- A `line-list` divider, then a footer row: a `meta-lg ink-secondary` status
  line, and the actions — "View application →" secondary always, plus a primary
  "Review offer" when status is `Offer`, plus a kebab menu (⋯, 36px
  `rounded-control`) offering "View job description", "Download submitted
  resume", and "Withdraw application" (`danger`, divided).

**StatusPill** — 99px radius, `pill` type, 5–6px × 10–11px padding, with a 6px
dot in the text color:

| Status | Fill / text |
| --- | --- |
| Draft | `neutral-pill` / `ink-slate` |
| Submitted, Under Review | `neutral-pill` / `ink-slate` |
| Interview | `accent-tint` / `accent-hover` |
| Offer, Hired | `success-bg` / `success` |
| Not Selected, Withdrawn | `neutral-pill` / `ink-slate` |

**Withdrawn and Not Selected rows stay in the list.** Body text drops to
`ink-muted`, the footer explains the outcome and date, and the actions reduce to
"View application →". Do not filter them out.

---

### 5. Application Detail — `/applications/:slug`

**Purpose:** the full record of one application.

Back link "‹ My Applications" as a ghost button, then a header with role
`page-title`, team `body-lg`, a `meta-lg` row carrying location · type ·
**requisition ref in mono** · applied date, and a right-aligned `StatusPill`.

**Status banner** below the header, tone driven by status: `success` for Offer,
`surface-sunken`/`line-card` for a closed application, `accent-tint` for
in-flight. `card-title` heading, `body-sm` explanation, and — only when there's
something to do — a primary CTA ("Review offer").

**Two columns**, wrapping: main `flex: 1 1 400px`, rail `flex: 0 1 300px`.

**Main column — five tabs** (Radix Tabs), 44px, 14px padding, active gets a 2px
`accent` bottom border and 600 weight; inactive `ink-slate` 400:

1. **Overview** — role summary, team, and what happens next.
2. **Timeline** — vertical rail: a 9px dot over a 1px `line-card` line, beside
   each entry's **mono `timeline-date`** (`AUG 25`), `item` title, and `body-sm`
   text. Dot color from `tone`: `success` / `accent` / `neutral-dot`.
3. **Documents** — the files submitted with this application: 34px `neutral-pill`
   file tile, name `label-lg`, `meta-xs` size, "View" secondary.
4. **Interviews** — interviews on this application, or an empty state.
5. **Notes** — recruiter-visible notes, or an empty state.

**Rail:** a Contact card (36px `accent-tint` initials circle, name, role, and a
full-width "Send a message" secondary) and a Quick actions card.

`slug` = `cc` gets the full five-tab treatment. `vp` and `dx` render from the
same data-driven component — that difference is prototype scaffolding, not
design intent. **Build one component for all applications.**

---

### 6. Interviews — `/interviews`

**Purpose:** upcoming and past interviews.

Header `page-title` "Interviews". Two tabs: Upcoming · Past.

**A panel day renders as ONE card**, not one card per session. Inside:

- Header: `card-title` "Panel interview day", the date, the full window, and a
  `StatusPill`.
- A `line-inner` divider, then the itinerary — one row per session **and per
  break**: mono time range in a fixed 118px column, then session title `item`,
  interviewers as `meta-lg` names with roles, and a focus line. Breaks render at
  `ink-muted` with no interviewer block.
- Footer: "View details" secondary, "Request reschedule" ghost, "Add day to
  calendar" ghost. A primary "Join interview" appears only inside the unlock
  window.

The prototype has an optional toggle to split the day into independent cards.
**Ship the single-card view**; the toggle was an exploration.

Past interviews render the same card at reduced emphasis, with the outcome in
place of the actions.

---

### 7. Interview Detail — `/interviews/:slug`

**Purpose:** everything needed to prepare.

Back link, then role and session header. Two columns.

**Main:** the itinerary again at full detail, each session expandable to show
its interviewers with initials circles, roles, and focus areas.

**Rail — three cards:**

1. **Join** — format, and either the join button (inside the window) or
   `meta-lg ink-muted` "The join link appears 15 minutes before your interview."
   Plus dial-in details.
2. **Prep checklist** — rows of a 16px checkbox and a `body-sm` label. Ticks
   `PATCH` and persist. A `meta` count reads "3 of 5 done".
3. **Resources** — file rows with name, `meta` type/size, and a download ghost
   button.

---

### 8. Messages — `/messages`, `/messages/:slug`

**Purpose:** correspond with recruiters.

**Two panes above `app:`.** Left 320px thread list, right the conversation, a
`line-card` divider between them, both inside one `rounded-card` `surface-card`
shell.

**Thread row** — 16px padding, `line-list` divider: 38px initials circle
(`accent-tint` / `accent-hover`), name `label-lg`, `meta` role, one-line
truncated preview `meta-lg`, right-aligned `meta-xs` date, and a 7px `accent`
dot when unread. Selected row is `accent-row`.

**Conversation pane** — a sticky header with the participant's name, role, and
the linked application as an `accent` link; then the message list; then the
composer.

- **Date separators**: centered `overline-sm ink-muted` over a `line-list` rule.
- **Incoming bubble**: `neutral-pill` fill, `ink` text, `rounded-card` with a
  4px bottom-left corner, max-width 62ch, `body-sm`, `meta-xs ink-muted`
  timestamp below.
- **Outgoing bubble**: `bg-accent`, white text, mirrored corner, right-aligned.
- **Composer**: a `line-input` textarea that grows to 5 rows, an attach ghost
  button, and a `bg-accent` send button disabled while empty. Enter sends,
  Shift+Enter newlines.

**Below `app:` the panes split into two routes.** `/messages` is the list;
tapping a thread pushes `/messages/:slug`, which shows the conversation with a
back arrow in place of the list. Browser back must return to the list.

---

### 9. Documents — `/documents`

**Purpose:** manage files, and see what's been requested.

Header `page-title` "Documents", sub "Manage documents associated with your
applications.", and a primary "＋ Upload document".

Two tabs: My Documents · Requested Documents.

**My Documents** — one card per file: 42px `neutral-pill` file tile; name
`item` with a `rounded-tag` `neutral-pill` kind chip beside it; `meta` size and
upload date; a "Used for:" line naming the applications; then "Preview"
secondary, "Download" secondary, and a kebab menu with "Replace file" and
"Delete" (`danger`).

Deleting is immediate with a toast. **When the list empties**, show: `card-title`
"No documents yet", `body-sm` "A resume is required before you can submit an
application.", and a primary "Upload a document".

**Requested Documents** — `warning`-toned cards: a `warning-bg` folder tile, the
document name, `meta-lg` "Requested by {name} · Due {date}", a `body-sm` note,
and a primary "Upload". Fulfilled requests move to a `success` treatment with a
check and the upload date.

---

### 10. Profile — `/profile`

**Purpose:** the profile every application inherits.

Header `page-title` "Profile", sub "Your profile is shared with every hiring
team you apply to.", and a "👁 Preview as recruiter" secondary opening the
recruiter modal.

Two columns: main `flex: 1 1 520px`, rail `flex: 0 1 314px`, gap
`clamp(14px,1.8vw,22px)`.

**Identity card** — 64px `bg-ink` circle with **the user's initials** in
`600 21px` white; name `value-lg`; `body ink-secondary` headline
(`{targetRole} · {city}`); two pills — "{n} active applications" in
`accent-tint`/`accent-hover` and the work-auth string in
`neutral-pill`/`ink-secondary`; and a "Change photo" secondary.

**Four inline-editable sections.** Each is a card with a `card-title` heading and
an "Edit" secondary that swaps the card body from read to edit mode, with
"Save changes" primary and "Cancel" secondary above a `line-inner` rule.

- **Personal information** — read mode is a `repeat(auto-fit, minmax(190px,1fr))`
  grid, 18px/24px gaps, each cell an `overline ink-muted` label over a
  `500 13.5px ink` value: Full name · Email · Phone · Location · Work
  authorization · Pronouns. Edit mode is the same grid at `minmax(200px,1fr)`
  with 42px fields.
- **Links &amp; profiles** — read mode is three rows, each a fixed 26px
  `meta-xs ink-muted` prefix (`in`, `gh`, `web`) beside an `accent` link. Edit
  mode is three stacked fields.
- **Job preferences** — same grid: Target role · Preferred locations · Earliest
  start · Work setup · Compensation expectation.
- **Voluntary self-identification** — heading plus this copy verbatim:
  "Optional. Answers are used for equal-opportunity reporting only, are never
  shown to the hiring team, and have no effect on your application." A
  Provided/Not provided pill sits top-right. The CTA reads "Answer the optional
  questions" or "Update answers". Edit mode is three selects (Gender, Veteran
  status, Disability status), each defaulting to "Prefer not to say".

**Work experience and Education** — repeatable rows, each `line-inner`-divided.
Read mode: title `item`, a `body-sm` sub joining org · period · location with
` · `, and a `body-sm` description capped at 62ch. Edit mode expands that row
into a field grid plus a textarea, with "Save position", "Cancel", and a
right-aligned "Remove" in `danger`. Header carries "＋ Add position" /
"＋ Add school", which appends a blank row already in edit mode.

**Skills** — chips: `bg-surface-page`, `line-chip` border, 99px radius,
`500 12.5px ink-chip`, each with a 16px `neutral-knob` remove button. Below, a
text field ("Add a skill and press Enter") and an "Add" secondary. Enter adds;
duplicates are silently ignored.

**Rail — three cards:**

1. **Profile strength** — `card-title` beside the percentage in
   `600 15px accent-hover`; a 7px `neutral-bar` track with an `accent` fill
   transitioning `width` over 300ms; a `meta-lg ink-muted` note ("3 items left
   to complete." / "Everything is filled in. Recruiters see a complete
   profile."); then the eight checks, each a 17px circle — done is
   `success-bg`/`success` with a `✓`, pending is `neutral-pill`/`ink-muted`
   empty — beside a `meta-lg` label. **Percentage comes from the server.**
2. **Resume** — file tile, name, `meta` size and date, then "Replace" and
   "All documents" secondaries.
3. **Visibility** — "Consider me for other roles" with `meta-lg ink-muted`
   explanation and a switch; a `line-inner` rule; then `meta ink-muted`
   "Last updated {date}".

---

### 11. Settings — `/settings?tab=`

Header `page-title` "Settings", sub "Account access, how we contact you, and
what happens to your data." Three tabs: Account · Notifications · Privacy &amp;
data. Max-width 880px.

**Account tab — five cards:**

- **Sign-in email** — the address, a `meta-lg ink-muted` caveat ("Used to sign
  in and to reach you about applications. Changing it signs you out of other
  devices."), and a "Change in Profile" secondary that routes to `/profile`
  **with the personal-information section already in edit mode**.
- **Password** — "Last changed {date}" and a "Change password" secondary that
  expands three 42px password fields below a `line-inner` rule, with the rule
  stated as `meta ink-muted` "At least 8 characters, including a number."
  Errors inline in `danger`. On success the card collapses to a `success-bgAlt`
  row: "Password updated. You'll stay signed in on this device."
- **Two-factor authentication** — description naming the phone, and a switch.
  When off, a `warning-bgAlt` notice: "Off. Your account is protected by
  password only."
- **Signed-in devices** — rows divided by `line-inner`: device + browser
  `label-lg`, a `success-bg` "THIS DEVICE" `rounded-tag` chip on the caller's
  own, `meta-lg` location and last-active, and a "Sign out" secondary on every
  row except the current one.
- **Language &amp; region** — three selects (Language, Time zone, Date format)
  in a `minmax(200px,1fr)` grid, then `meta-lg ink-muted` "Interview times are
  always shown in your time zone: {tz}."

**Notifications tab — two cards:**

- **How we reach you** — `meta-lg ink-muted` preamble: "Interview invitations
  and reschedules are always sent by email — that channel can't be turned off."
  Then a grid, `minmax(150px,1fr) 62px 62px 62px`: a header row of
  `overline-sm` EMAIL / SMS / IN-APP over five rows, each a `label-lg` event
  name with a `meta` description and three switches.

  | Row | Description |
  | --- | --- |
  | Application status changes | Moved forward, on hold, or closed |
  | Interview invitations | Invites, reschedules and reminders |
  | Messages from recruiters | New replies in your threads |
  | Document requests | Files the hiring team needs from you |
  | New roles matching my profile | Openings you haven't applied to |

  **Interview invitations → Email is locked on**: rendered as a non-interactive
  `accent-locked` track with the knob at the on position, `title="Always on"`,
  and no handler. The server rejects the change too.
- **Pause non-urgent notifications** — description "Holds role matches and
  general updates. Interview and message alerts still come through." and a
  switch. Below a `line-inner` rule, a "Summary email" select (Off / Daily /
  Weekly on Monday).

**Privacy &amp; data tab — three cards:**

- **Download your data** — description, then a "Request export" secondary. While
  preparing: a 15px spinner beside "Preparing your file. This usually takes a
  minute." When ready: a `success-bgAlt` row with the filename, "4.8 MB · link
  expires in 7 days", and a `bg-accent` "Download".
- **How long we keep your data** — the retention statement plus "Privacy
  notice" and "Candidate data FAQ" links separated by a `ink-disabled` `·`.
- **Delete your account** — the one card with a `danger-border` border. Heading
  in `danger-heading`, description, and a "Delete account" button with
  `danger-borderStrong` border and `danger` text.

---

### 12. Notification Center — `/notifications`

Header `page-title` "Notifications", sub is the unread count ("3 unread
notifications" / "You're all caught up."). Right: "Mark all as read" and
"Notification settings" secondaries. Max-width 860px.

**Filter chips:** All · Unread · Interviews · Messages · Documents ·
Applications. Same chip treatment as Applications; Unread appends its count.

**Grouped by recency** — Today · Yesterday · Earlier this week · Earlier — each
group headed by `overline` (0.08em) `ink-muted`. Empty groups are omitted.

**Notification card** — 16px/18px padding, `rounded-card`, 14px gap:

- A 36px `rounded-control` icon tile colored by kind (see `data-models.md`).
- Title `item` (600 unread / 500 read) with a 7px `accent` dot when unread;
  `body-sm ink-secondary` description capped at 62ch; `meta ink-muted` context
  line; and a contextual action secondary when one exists.
- A 30px dismiss `×` at the right in `ink-subtle`.
- Unread cards get `bg-accent-row` and `border-accent-tintStrong`; read cards
  get `surface-card` and `line-card`.

Clicking the action marks it read and routes to the target.

**Empty state** — a 44px `neutral-pill` bell circle, `600 16px` heading
("No notifications" or "Nothing under {filter}"), `body` explanation, and a
"Show all notifications" secondary.

---

### 13. Offer — `/applications/:slug/offer`

**Purpose:** review, counter the start date, then accept or decline.

Back link, then a header: a `success-bg` "OFFER" pill, role `page-title`, team +
location `body-lg`. Right, while pending: a `warning-bgAlt` panel with
`warning` `overline` "RESPOND BY" over the date in `500 13.5px`.

**Resolved states replace that panel with a banner at the top of the column:**

- Accepted — `success-bgAlt`, 36px `success` check circle, "Offer accepted",
  then "Signed by {name} · {timestamp}. A countersigned copy is on the way to
  {email}." and "Your onboarding contact will reach out within two business
  days about your {startDate} start."
- Declined — `danger-bg`, "Offer declined", then "Recruiting has been notified.
  This application is now closed, and your profile stays active for future
  roles."

**Cards:**

1. **Offer summary** — a `minmax(180px,1fr)` grid of `overline`/`500 13.5px`
   pairs: Title · Team · Employment type · Location · Reports to ·
   Contingencies. Below a `line-inner` rule, the offer letter row: file tile,
   name, "Full written terms, including compensation · PDF · 218 KB", and a
   "Preview" secondary.
2. **Start date** — the date in `value`, a `body-sm` note that changes once
   countered ("You proposed this date. Recruiting confirms within one business
   day — the original {date} date holds until then."), and a "Propose another
   date" secondary. Edit mode is a native date input bounded to the allowed
   window, with `meta-lg ink-muted` "Recruiting confirms a proposed change
   before it becomes final. Onboarding cohorts start on Mondays.", then
   "Propose this date" primary and "Cancel".
3. **Your decision** — pending only. `body-sm` "Accepting opens a short
   signature step. Nothing is final until you sign." Then an "Accept offer"
   primary (min 180px) and a "Decline" secondary.
4. **Questions** — "Questions before you decide?" with "Message recruiting".

**Compensation lives in the letter, not on screen.** That's intentional — do not
surface a salary figure in the summary grid.

---

### 14. Help &amp; Candidate FAQ — `/help`

Max-width 680px. Header `page-title` "Help &amp; Candidate FAQ", sub "Answers to
the questions candidates ask most."

A 46px search input ("Search help topics") filtering title and body live, then
one `surface-card` `rounded-card` shell containing eight accordion rows
(Radix Accordion), each divided by `line-list`:

- Trigger: full-width 16px/18px button, `label-lg`-ish question at
  `500 13.5px/1.45` (600 when open), and a 20px `+` / `−` in `ink-muted` at the
  right. Hover `surface-hoverSoft`.
- Panel: `body` at `400 13.5px/1.65 ink-secondary`, padded `0 52px 18px 18px`.

No match shows, inside the shell: "No topics match "{query}". Try a different
word, or message your recruiter below."

Below the shell, a contact card: "Still need help?" / "Your recruiter replies
within one business day." and a `bg-accent` "Message recruiting".

The eight questions and answers are in `seed-data.json` under `faq` — serve them
from `GET /faq` rather than hardcoding them in the client.

---

### 15. Session expired — `/session-expired`

Chrome-less: full viewport `bg-surface-page`, centered 460px `surface-card` card
with `line-card`, `rounded-modal`, `shadow-float`, padding
`clamp(26px,4vw,38px)`.

A 46px `warning-bg` circle with a `warning` clock icon; `600 23px/1.25 −0.016em`
"Your session expired"; `body` "You were signed out after 30 minutes of
inactivity. Nothing was lost — drafts and uploads are saved to your account.";
a `surface-page` inset panel reading "Signing back in returns you to
{lastLocation}."; a full-width 48px `bg-accent` "Sign in again"; and a centered
`meta-lg` "Trouble signing in? **Reset your password**".

Reached by the Axios 401 interceptor. Capture the pre-expiry pathname so the
"returns you to" line is accurate and the post-login redirect lands there.

---

### 16. Not found — `*`

Inside the app shell. A centered 560px card: `600 22px` "We can't find that
page", `body` "The link may be out of date, or the page moved. Everything about
your applications is still here.", then "Back to Overview" primary and
"Help &amp; FAQ" secondary. Below a `line-inner` rule, `meta-lg ink-muted`
"Signed out unexpectedly? **See what happened**" linking to
`/session-expired`.

---

## Modals &amp; overlays

Nine. All Radix `Dialog`: `scrim` overlay, centered, 20px viewport padding,
`surface-card`, `rounded-modal`, `shadow-modal`, `clamp(22px,3vw,28px)` padding,
`max-height: 86–88vh` with internal scroll. **Escape and overlay click close
every one of them** (that's Radix's default — don't disable it). Focus returns
to the trigger.

### Availability / Reschedule calendar

One component, two modes. `schedMode: 'avail'` is opened from the Overview
action card and the availability notification; `'resched'` from Overview,
Application Detail, Interviews, and Interview Detail.

Max-width 560px.

| | Availability | Reschedule |
| --- | --- | --- |
| Title | "Submit your availability" | "Request a reschedule" |
| Intro | "Pick every date and time that works. Recruiting builds the panel day from what you send." | "Panel interview day · {date}. Recruiting will confirm a new time — nothing changes until they do." |
| Reason field | hidden | shown |

**Controls row:** a 32px prev / 118px month label / 32px next group on the left,
and a `flex: 0 1 210px` timezone select on the right, defaulting to the user's
`settings.timezone`.

**Month grid:** `repeat(7, 1fr)`, 4px gap. A header row of `overline-sm`
Mon–Sun, then 38px day cells, `rounded-control`. Leading blanks are transparent
and non-interactive.

| Cell state | Fill / border / text |
| --- | --- |
| Selectable | `surface-card` / `line-card` / `ink`, hover border `accent` |
| Selected | `accent` / `accent` / white, 600 |
| Weekend or past | `surface-sunken` / `line-card` / `ink-disabled`, `not-allowed` |

**Time chips:** shown once a date is picked, under a `label-lg` header reading
"Times on {date} · {tzAbbr}". Each is a 38px `rounded-control` chip. Taken slots
append " · taken" and are disabled at `surface-sunken`/`#B6C1CF`. Selected chips
are `bg-accent` white 600. Before a date is picked, an inset `surface-page`
panel reads "Pick a date above to see open times. Weekends and past dates are
unavailable." plus, in availability mode, "The team needs your times before
{dueDate}."

**Selected-slot summary:** an `accent-wash` panel with a `600 11px accent-hover`
uppercase count ("2 times selected") over one row per slot — the full
`{weekday}, {Mon} {d} · {time} {tz}` label and a 22px remove `×`.

**The timezone conversion is the one place this design is easy to get wrong.**
Convert each slot's UTC instant into the selected zone, then derive the date
label **from the converted instant** — not from the calendar cell the user
clicked. A 1:00 PM PT slot viewed in IST is 1:30 AM *the following day*, so the
label must read "Thu, Sep 10", not "Wed, Sep 9". Chips append the rolled weekday
when the date shifts.

```js
// client/src/lib/datetime.js
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

export const inZone = (iso, tz) => new TZDate(iso, tz);
export const slotLabel = (iso, tz, abbr) => {
  const d = inZone(iso, tz);
  return `${format(d, 'EEE, MMM d')} · ${format(d, 'h:mm a')} ${abbr}`;
};
```

**Selectable range comes from `GET /availability/request`.** Never hardcode a
month — that is exactly how the prototype ended up offering September dates for
an August deadline.

**Footer:** "Cancel" secondary, and a primary that is disabled with no slots
selected ("Send availability" / "Send request").

**Success modal** (max-width 440px): a 42px `success-bg` check circle, "{Availability|Request} sent", the explanation, a `surface-page` recap listing the chosen slots, and a full-width "Done".

### Withdraw application

Max-width 472px. "Withdraw this application?", the role in `500 13.5px` and team
in `meta`, then a `danger-bg` callout: "This can't be undone. Recruiting will be
notified, any scheduled interviews will be cancelled, and you'll need to reapply
if you change your mind." Footer: "Keep application" secondary and "Withdraw
application" in `bg-danger`.

### Upload document

Four states in one dialog: **idle** (dashed dropzone, same treatment as sign-up
step 3, accepting drag-and-drop and click), **uploading** (filename, a
`neutral-bar` progress track with an `accent` fill, and "{n}% · uploading" —
driven by `onUploadProgress`), **error** (a `danger` row naming the reason —
oversize or wrong type — with "Try another file"), **done** (a `success` check
row and "Done"). Title varies by intent: "Upload a document" / "Replace
document" / "Upload candidate questionnaire" / "Upload a profile photo" /
"Replace your resume".

### Document preview

Max-width 560px, `scrim-strong`. A header with the filename, a "Download"
secondary and a close `×`; a `surface-preview` desk holding a 360px-max
`8.5/11` white page with `shadow-paper`; and a `line-inner`-topped footnote
"Preview only — download for the full document." Replace the placeholder page
with the real rendered document.

### Preview as recruiter

Max-width 560px, scrollable, sticky header ("Recruiter view" / "What the hiring
team sees on your applications."). Body: the user's initials avatar and name,
a Contact / Work authorization grid, then Experience, then Skills, then a
`surface-page` footnote: "Self-identification answers and compensation
expectations are never included in this view." **Render from
`GET /me/profile/recruiter-view`**, so the promise is enforced server-side.

### Sign and accept (e-signature)

Max-width 500px. Title "Sign and accept", sub "{role} · {team} · starting
{date}". A 48px signature field — `400 19px` **italic** — labelled "Type your
full legal name" with the user's name as placeholder and `meta ink-muted` "Must
match {fullName} exactly." Then a bordered consent row: "I have read the written
offer and agree that this typed signature is legally binding, equivalent to a
handwritten signature." Errors inline in `danger`. Footer: "Cancel" and
"Sign and accept".

Validation: trimmed, case-insensitive match against `fullName`
("Type your name exactly as it appears on your profile.") and consent checked
("Tick the box to confirm your signature."). **The server validates the same
rule** — see `api-contract.md`.

### Decline offer

Max-width 472px. "Decline this offer?", body "This closes the {role}
application. Your profile stays active for other roles.", an optional reason
textarea placeholdered "Helps the team improve — never shared with the hiring
manager.", then "Keep reviewing" and a `bg-danger` "Decline offer".

### Delete account

Max-width 472px. "Delete your account?", a `danger-bg` callout naming the
consequences, then a field labelled "Type **DELETE** to confirm". The
destructive button stays `danger-disabled` with `cursor: not-allowed` until the
input matches exactly, then flips to `danger`. Footer: "Keep my account" and
"Delete account".

### Toast

Not a dialog — a `role="status" aria-live="polite"` strip, fixed, centered,
`bottom: 88px` (clear of the mobile tab bar), `bg-ink`, `rounded-button`,
`shadow-toast`, 12px/16px padding: a 16px `rgba(255,255,255,.16)` check circle
beside `500 13px` white text. Auto-dismisses at 2800ms. Used for downloads,
calendar adds, joins, attachments, and deletes.

---

## Interactions &amp; behavior

- **Navigation** is real routing throughout. Every "View", "Review", back link,
  and notification action is a route change with a working browser back button.
- **Focus** is `accent` border + `shadow-focus` on fields; a visible ring on
  buttons. Never remove the outline without replacing it.
- **Hover** raises backgrounds one step (`surface-hover`) or brightens borders
  (`line-control` → `line-controlHover`) over 150ms. Primary buttons go
  `accent` → `accent-hover`.
- **Disabled** buttons keep their layout, drop to the muted variant
  (`accent-disabled`, `danger-disabled`), and take `cursor: not-allowed`.
- **Loading:** list screens get skeleton cards matching real row height — never
  a centered spinner that shifts layout. In-button work replaces the label with
  the 15px spinner and keeps the width.
- **Errors:** field-level via React Hook Form `setError`, using the server's
  `error.field`. Request-level failures get a `danger-bg` inline callout with a
  retry, not a toast.
- **Empty states** exist and are specified for: applications (none yet),
  interviews (upcoming/past), messages (no threads), documents (both tabs),
  notifications (per filter), help (no search match). Each is a heading, one
  explanatory line, and a single action.
- **Optimistic updates** are appropriate for: sending a message, ticking a prep
  item, toggling a notification channel, toggling visibility. Everything
  consequential — withdraw, accept, decline, delete, upload — waits for the
  server.

### Responsive

One breakpoint: `app:` at 900px.

| Below 900px | At/above |
| --- | --- |
| Bottom tab bar, nav in a drawer | Fixed 248px sidebar |
| Messages splits into list and thread routes | Two panes side by side |
| Two-column screens stack (rail below main) | Side by side, rail on the right |
| Login's context panel hidden | Both panels |
| Header shows initials only | Initials + full name |
| Content padded 82px at the bottom | Normal padding |

Cards use `flex-wrap` and `minmax()` grids, so intermediate widths reflow
without extra breakpoints. Touch targets are never below 44px.

### Accessibility

- Every icon-only button has an `aria-label` (they're in the prototype — keep
  them).
- Switches are `role="switch"` with `aria-checked`. The locked one is not a
  button at all.
- Modals are `role="dialog" aria-modal="true"` with `aria-labelledby` on the
  title. Radix handles the focus trap and restore.
- Tabs, accordion, and dropdowns via Radix for correct roles and arrow-key
  navigation.
- Error rows are `role="alert"`; the toast is `role="status" aria-live="polite"`.
- Status is never color-only: pills carry text, timeline dots sit beside dated
  labels, unread state pairs a dot with a weight change.
- Contrast: `ink` on `surface-card` is 14.8:1; `ink-secondary` 5.9:1;
  `ink-muted` on white 3.6:1 — **`ink-muted` is for meta text at 12px+ only,
  never for anything actionable.**

---

## State management

Both libraries are in the stack, so the split needs to be explicit or they'll
overlap.

**TanStack Query owns everything from the server.** Applications, interviews,
documents, threads, messages, notifications, offer, profile, settings, FAQ. No
server data is duplicated into Redux. Keys and the invalidation map are in
`api-contract.md`.

**Redux Toolkit owns client-only state** — three slices:

```js
// store/slices/ui.js — what's open
{
  drawerOpen: false,
  notifMenuOpen: false,
  userMenuOpen: false,
  modal: null,          // 'availability' | 'reschedule' | 'withdraw' | 'upload'
                        // | 'docPreview' | 'recruiterPreview' | 'signature'
                        // | 'decline' | 'deleteAccount'
  modalPayload: null,   // { applicationSlug } | { documentSlug } | { mode }
  toast: null           // { message } — cleared on a timer
}

// store/slices/filters.js — survives navigation, belongs in the URL too
{
  applications: { status: 'all', sort: 'recent' },
  notifications: { filter: 'all' },
  interviews:    { tab: 'upcoming' },
  documents:     { tab: 'mine' },
  settings:      { tab: 'account' }
}

// store/slices/drafts.js — in-progress edits not yet submitted
{
  profileSection: null,       // 'personal' | 'links' | 'prefs' | 'eeo'
  profileRow: null,           // experience/education row id being edited
  signup: { step: 1, values: {} },
  availability: { month: null, day: null, timezone: null, slots: [] }
}
```

Mirror `filters` into search params so a filtered list is shareable and survives
reload. Form field values live in React Hook Form, not Redux — `drafts` tracks
only *which* thing is open.

### Identity propagation

The chrome reads the authenticated user, not a constant:

| Element | Source |
| --- | --- |
| Header avatar initials | `me.initials` |
| Header name | `me.fullName` |
| User dropdown name | `me.fullName` |
| Overview greeting | `me.firstName` |
| Profile card avatar | `me.initials` |
| Recruiter preview avatar | `me.initials` |

Any profile mutation must invalidate `qk.me` alongside `qk.profile`, or the
chrome goes stale while the profile page updates. This was a real bug in the
prototype — a signed-up "Asha Patel" saw "SB / Swaraj Bangar" in the header.

---

## Assets &amp; icons

**Icons:** `lucide-react` throughout, 18px in nav and chrome, 14–17px inline,
`strokeWidth={1.6}`, `currentColor`. The prototype hand-draws equivalents; map
them:

| Prototype | Lucide |
| --- | --- |
| `home` | `Home` |
| `doc` | `FileText` |
| `cal` | `Calendar` |
| `chat` | `MessageSquare` |
| `folder` | `Folder` |
| `user` | `User` |
| `gear` | `Settings` |
| `dots` | `MoreVertical` |
| chevrons | `ChevronLeft` / `ChevronRight` / `ChevronDown` |
| upload | `Upload` |
| eye ("Preview as recruiter") | `Eye` |
| clock (session expired) | `Clock` |
| bell (notifications empty) | `Bell` |
| plus | `Plus` |
| close `×` | `X` |
| check `✓` | `Check` |

**No images.** No photography, no illustration, no logo files. The brand mark is
typographic — a monogram tile plus a wordmark, both live type. Avatars are
initials on `bg-ink` or `bg-accent-tint`, never uploaded photos (the "Change
photo" button opens the upload modal but the design never shows a photo state —
if you add one, keep the initials fallback).

**One emoji** in the entire product: 👋 in the Overview greeting. Don't add more.

---

## Suggested build order

Each step leaves the app runnable.

1. **Foundation** — Vite + Tailwind with the config from this bundle, Geist
   fonts, `cn()`, Axios instance, Query provider, Redux store, router skeleton.
2. **Server foundation** — Express, Mongoose against Atlas, the six models, the
   seed script, cookie auth, the error middleware.
3. **Primitives** — Button (4 variants × 5 sizes), Card, Badge/StatusPill,
   Field, Select, Switch, Tabs, Modal, Toast, EmptyState, Skeleton. Build these
   against the token names before any screen.
4. **Auth + shell** — Login, sign-up wizard, session-expired, the 401
   interceptor, then Sidebar / TopBar / MobileTabBar / drawer.
5. **Read-only screens** — Overview, Applications, Application Detail,
   Interviews, Interview Detail. Real data, no mutations.
6. **Mutations** — withdraw, prep checklist, profile sections, skills,
   experience, education, settings.
7. **Documents + upload** — both tabs, the upload modal with real progress, the
   preview modal.
8. **Messages** — two-pane, the mobile split, the composer.
9. **Notifications** — the page, the bell dropdown off the same query, read and
   dismiss.
10. **Offer** — summary, start-date counter, signature, decline, and the
    accepted/declined states.
11. **Help, 404, and every empty state.**
12. **Pass on a11y, keyboard, and reduced motion.**

---

## Files in this bundle

| File | What it is |
| --- | --- |
| `KICKOFF-PROMPT.md` | **Start here** — the prompt to paste into Claude Code, plus follow-ups per build step |
| `README.md` | This document — the complete spec |
| `api-contract.md` | Every endpoint, payload, error code, and the TanStack Query key + invalidation map |
| `data-models.md` | Mongoose schemas for all six collections, plus the seed plan |
| `tailwind.config.js` | The design tokens as a Tailwind theme — drop straight into `client/` |
| `seed-data.json` | The prototype's actual content: applications, threads, documents, notifications, offer, FAQ |
| `design-reference/Candidate Portal App.dc.html` | The interactive prototype. Open in a browser; click through every screen and modal |
| `design-reference/support.js` | Runtime the prototype needs to render. Not part of the app |
| `screenshots/` | 25 stills, numbered in the order of the "Screens" and "Modals" sections |

### Screenshot index

| File | Shows |
| --- | --- |
| `01-login.png` | Login, both panels |
| `02-signup-step-1.png` | Sign-up wizard, step 1 with the step bar |
| `03-overview.png` | Overview — action card, applications, chrome |
| `04-applications.png` | My Applications with filter chips and rows |
| `05-application-detail.png` | Application Detail, Overview tab |
| `06-interviews.png` | Interviews — the single panel-day card |
| `07-interview-detail.png` | Interview Detail with prep and resources |
| `08-messages.png` | Messages, two-pane |
| `09-documents-mine.png` | Documents — My Documents tab |
| `10-profile.png` | Profile — identity card, sections, strength rail |
| `11-settings-account.png` | Settings — Account tab |
| `12-notifications.png` | Notification Center with filters and groups |
| `13-settings-notifications.png` | Settings — the channel grid, incl. the locked switch |
| `14-settings-privacy.png` | Settings — Privacy &amp; data, incl. the danger card |
| `15-documents-requested.png` | Documents — Requested tab |
| `16-offer.png` | Offer, pending state |
| `17-offer-accepted.png` | Offer, accepted state with the signed banner |
| `18-help.png` | Help &amp; FAQ with the accordion |
| `19-modal-availability-empty.png` | Calendar modal, no date picked |
| `20-modal-availability-date-picked.png` | Calendar modal with time chips |
| `21-modal-availability-slots-selected.png` | Calendar modal with the selection summary |
| `22-modal-signature.png` | Signature modal, empty |
| `23-modal-signature-filled.png` | Signature modal, name typed and consent ticked |
| `24-modal-upload.png` | Upload modal, idle dropzone |
| `25-notification-bell-dropdown.png` | The bell dropdown open |

**Two screens have no still:** Session expired and Not found. Neither is
reachable by clicking in the prototype (the 404 only renders for an unknown
route, and session-expired is reached from it). To see them, open the design file
and set its `startRoute` control to `expired`. Both are fully specified above.
