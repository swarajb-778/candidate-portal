import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { TZDate } from '@date-fns/tz';

import { connect } from '../db.js';
import { User, Application, Interview, Document, Notification, Thread, Message, Offer } from '../models/index.js';
import { asha, miguel } from './extra-candidates.js';
import { clearUploads, writePlaceholder } from './placeholder-file.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(here, 'seed-data.json'), 'utf8'));

// Throwaway credential for a seeded corpus. Never a default in a real system.
const SEED_PASSWORD = 'portal1234';

// The corpus is authored around a fixed "now" — the prototype's own
// "Last updated: Aug 25, 2026". Left literal, the panel day falls into the past
// once real time moves on and the Overview loses its next-interview card.
// Dates slide to today by default so the demo is always live; every interval
// between events is preserved. `npm run seed -- --literal` keeps the raw corpus
// dates, which is what you want when comparing against the reference stills.
const CORPUS_TODAY = '2026-08-25';
const SHIFT_DAYS = process.argv.includes('--literal')
  ? 0
  : Math.round((Date.now() - Date.parse(`${CORPUS_TODAY}T00:00:00Z`)) / 86_400_000);

const ISO = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/;

// Walks the seed spec and shifts every ISO date it finds, in place of dozens of
// call-site conversions.
const shiftDates = (value) => {
  if (!SHIFT_DAYS) return value;
  if (typeof value === 'string' && ISO.test(value)) {
    const dateOnly = !value.includes('T');
    const d = new Date(dateOnly ? `${value}T00:00:00Z` : value);
    d.setUTCDate(d.getUTCDate() + SHIFT_DAYS);
    return dateOnly ? d.toISOString().slice(0, 10) : d.toISOString();
  }
  if (Array.isArray(value)) return value.map(shiftDates);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shiftDates(v)]));
  }
  return value;
};

// A wall-clock time in a named zone, as a real UTC instant. This is the same
// conversion the availability calendar does — never an offset table.
const zonedInstant = (isoDate, hhmm, tz) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const [hh, mi] = hhmm.split(':').map(Number);
  return new Date(TZDate.tz(tz, y, m - 1, d, hh, mi, 0).getTime());
};

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const isWeekend = (iso) => [0, 6].includes(new Date(`${iso}T00:00:00Z`).getUTCDay());

async function seedCandidate(spec, storageKey) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const user = await User.create({
    ...spec.user,
    passwordHash,
    passwordChangedAt: spec.user.passwordChangedAt ?? new Date('2026-06-02T00:00:00Z'),
    devices: (spec.sessions ?? []).map((s) => ({
      key: s.id,
      name: s.name,
      location: s.location,
      lastActive: s.lastActive === 'now' ? new Date() : new Date(s.lastActive),
      current: s.current === true
    }))
  });

  const appBySlug = new Map();
  for (const a of spec.applications ?? []) {
    const { documents: _ignored, ...rest } = a;
    appBySlug.set(a.slug, await Application.create({ ...rest, user: user._id }));
  }

  const docBySlug = new Map();
  for (const d of [...(spec.documents ?? []), ...(spec.documentRequests ?? [])]) {
    const doc = await Document.create({
      ...d,
      user: user._id,
      mimeType: 'application/pdf',
      storageKey: d.request?.isRequested ? undefined : storageKey,
      usedFor: (d.usedFor ?? []).map((slug) => appBySlug.get(slug)?._id).filter(Boolean)
    });
    docBySlug.set(d.slug, doc);
  }

  // Applications carry the documents submitted with them — resolved after both
  // sides exist so the link goes both ways.
  for (const a of spec.applications ?? []) {
    const ids = (a.documents ?? []).map((slug) => docBySlug.get(slug)?._id).filter(Boolean);
    if (ids.length) await Application.updateOne({ _id: appBySlug.get(a.slug)._id }, { documents: ids });
  }

  for (const iv of spec.interviews ?? []) {
    const { applicationSlug, ...rest } = iv;
    await Interview.create({
      ...rest,
      user: user._id,
      application: appBySlug.get(applicationSlug)._id,
      joinUrl: `https://meet.example.com/${iv.slug}`,
      availabilityRequest: buildAvailabilityRequest(spec.availabilityRequest, iv.slug)
    });
  }

  let messageCount = 0;
  for (const t of spec.threads ?? []) {
    const { messages = [], applicationSlug, ...rest } = t;
    const thread = await Thread.create({
      ...rest,
      user: user._id,
      application: appBySlug.get(applicationSlug)?._id,
      lastMessageAt: messages.length ? new Date(messages.at(-1).sentAt) : undefined
    });
    if (messages.length) {
      await Message.insertMany(messages.map((m) => ({ ...m, thread: thread._id })));
      messageCount += messages.length;
    }
  }

  for (const n of spec.notifications ?? []) {
    await Notification.create({ ...n, user: user._id });
  }

  if (spec.offer) {
    const { applicationSlug, _startDateWindow, ...rest } = spec.offer;
    await Offer.create({
      ...rest,
      user: user._id,
      application: appBySlug.get(applicationSlug)._id,
      startDateWindow: rest.startDateWindow ?? _startDateWindow,
      letter: { ...rest.letter, storageKey }
    });
  }

  return {
    email: user.email,
    applications: appBySlug.size,
    documents: docBySlug.size,
    interviews: (spec.interviews ?? []).length,
    threads: (spec.threads ?? []).length,
    messages: messageCount,
    notifications: (spec.notifications ?? []).length,
    offer: spec.offer ? spec.offer.stage : '—'
  };
}

// Slots are generated from this template per requested date rather than stored
// as ~350 subdocuments across the window.
function buildAvailabilityRequest(req, interviewSlug) {
  if (!req || req.interviewSlug !== interviewSlug) return undefined;

  const tz = req.timezone;
  const { localStarts, durationMinutes } = req._slotTemplate;
  const windowStartDate = req.windowStart.slice(0, 10);

  // A handful of slots are already booked, so the "· taken" chip state is real.
  const takenStarts = [];
  let cursor = windowStartDate;
  for (let found = 0; found < 2; ) {
    if (!isWeekend(cursor)) {
      takenStarts.push(zonedInstant(cursor, localStarts[1], tz), zonedInstant(cursor, localStarts[2], tz));
      found += 1;
    }
    cursor = addDays(cursor, 1);
  }

  return {
    open: true,
    dueAt: new Date(req.dueAt),
    windowStart: new Date(req.windowStart),
    windowEnd: new Date(req.windowEnd),
    timezone: tz,
    note: req.note,
    localStarts,
    durationMinutes,
    takenStarts
  };
}

async function run() {
  await connect();

  const wiped = await Promise.all(
    [User, Application, Interview, Document, Notification, Thread, Message, Offer].map((M) =>
      M.deleteMany({}).then((r) => r.deletedCount)
    )
  );
  const clearedFiles = clearUploads();
  console.log(
    `Wiped ${wiped.reduce((a, b) => a + b, 0)} existing documents and ${clearedFiles} uploaded file(s).\n`
  );

  const storageKey = writePlaceholder();

  const rows = [];
  rows.push(await seedCandidate(shiftDates(data), storageKey));
  rows.push(await seedCandidate(shiftDates(asha), storageKey));
  rows.push(await seedCandidate(shiftDates(miguel), storageKey));

  console.table(rows);
  console.log(
    SHIFT_DAYS
      ? `\nDates shifted ${SHIFT_DAYS > 0 ? '+' : ''}${SHIFT_DAYS} days so the corpus sits around today.`
      : '\nDates are the literal corpus values (--literal).'
  );
  console.log(`FAQ entries served from seed-data.json: ${data.faq.length}`);
  console.log(`Password for all three accounts: ${SEED_PASSWORD}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
