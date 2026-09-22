import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { Router } from 'express';

import { Application, Offer } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

export const offerRoutes = Router();
offerRoutes.use(wrap(requireAuth));

const RESOLVED = ['accepted', 'declined', 'expired'];

const load = async (userId, slug) => {
  const application = await Application.findOne({ user: userId, slug });
  if (!application) throw new ApiError(404, 'NOT_FOUND', 'No such application.');

  const offer = await Offer.findOne({ user: userId, application: application._id });
  if (!offer) throw new ApiError(404, 'NOT_FOUND', 'This application has no offer.');

  return { application, offer };
};

offerRoutes.get(
  '/:applicationSlug',
  wrap(async (req, res) => {
    const { application, offer } = await load(req.user._id, req.params.applicationSlug);
    res.json({ ...offer.toJSON(), applicationSlug: application.slug });
  })
);

// The company's date stays authoritative until recruiting confirms, so this
// only ever writes proposedByCandidate.
offerRoutes.patch(
  '/:applicationSlug/start-date',
  wrap(async (req, res) => {
    const { offer } = await load(req.user._id, req.params.applicationSlug);
    if (RESOLVED.includes(offer.stage)) {
      throw new ApiError(409, 'ALREADY_RESOLVED', 'This offer is already resolved.');
    }

    const value = String(req.body?.proposedByCandidate ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new ApiError(400, 'BAD_DATE', 'Pick a date.', 'proposedByCandidate');
    }

    // Onboarding cohorts start on Mondays.
    if (new Date(`${value}T00:00:00Z`).getUTCDay() !== 1) {
      throw new ApiError(400, 'NOT_MONDAY', 'Onboarding cohorts start on Mondays.', 'proposedByCandidate');
    }

    const { min, max } = offer.startDateWindow ?? {};
    if ((min && value < min) || (max && value > max)) {
      throw new ApiError(400, 'OUT_OF_WINDOW', 'Pick a date inside the allowed window.', 'proposedByCandidate');
    }

    offer.startDate.proposedByCandidate = new Date(`${value}T00:00:00Z`);
    await offer.save();
    res.json(offer.toJSON());
  })
);

offerRoutes.post(
  '/:applicationSlug/accept',
  wrap(async (req, res) => {
    const { application, offer } = await load(req.user._id, req.params.applicationSlug);
    if (RESOLVED.includes(offer.stage)) {
      throw new ApiError(409, 'ALREADY_RESOLVED', 'This offer is already resolved.');
    }

    if (req.body?.agreed !== true) {
      throw new ApiError(400, 'CONSENT_REQUIRED', 'Tick the box to confirm your signature.', 'agreed');
    }

    // The same rule the form enforces — trimmed, case-insensitive. Enforced
    // here so the client is never the only thing standing between a mismatched
    // name and a signed offer. Runs of internal whitespace are collapsed too:
    // a double space is invisible to whoever typed it.
    const normalise = (v) => String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
    const typed = String(req.body?.typedName ?? '').trim().replace(/\s+/g, ' ');
    if (normalise(typed) !== normalise(req.user.fullName)) {
      throw new ApiError(422, 'SIGNATURE_MISMATCH', 'Type your name exactly as it appears on your profile.', 'typedName');
    }

    const now = new Date();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        offer.stage = 'accepted';
        offer.signature = { typedName: typed, agreedAt: now, ip: req.ip };
        offer.startDate.confirmed = offer.startDate.proposedByCandidate ?? offer.startDate.proposedByCompany;
        await offer.save({ session });

        application.status = 'Hired';
        application.timeline.push({
          at: now,
          title: 'Offer accepted',
          text: `Signed by ${req.user.fullName}. A countersigned copy is on the way.`,
          tone: 'success'
        });
        await application.save({ session });
      });
    } finally {
      await session.endSession();
    }

    res.json({ ...offer.toJSON(), applicationSlug: application.slug });
  })
);

offerRoutes.post(
  '/:applicationSlug/decline',
  wrap(async (req, res) => {
    const { application, offer } = await load(req.user._id, req.params.applicationSlug);
    if (RESOLVED.includes(offer.stage)) {
      throw new ApiError(409, 'ALREADY_RESOLVED', 'This offer is already resolved.');
    }

    const now = new Date();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        offer.stage = 'declined';
        offer.declineReason = String(req.body?.reason ?? '').trim();
        await offer.save({ session });

        application.status = 'Withdrawn';
        application.closedAt = now;
        application.closeNote = 'You declined this offer. Your profile stays active for other roles.';
        application.timeline.push({
          at: now,
          title: 'Offer declined',
          text: 'Recruiting has been notified and this application is now closed.',
          tone: 'neutral'
        });
        await application.save({ session });
      });
    } finally {
      await session.endSession();
    }

    res.json({ ...offer.toJSON(), applicationSlug: application.slug });
  })
);

offerRoutes.get(
  '/:applicationSlug/letter',
  wrap(async (req, res) => {
    const { offer } = await load(req.user._id, req.params.applicationSlug);
    const file = path.join(UPLOAD_DIR, offer.letter?.storageKey ?? '');

    if (!offer.letter?.storageKey || !fs.existsSync(file)) {
      throw new ApiError(404, 'FILE_MISSING', 'The offer letter is no longer stored.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${offer.letter.name.replace(/"/g, '')}"`);
    fs.createReadStream(file).pipe(res);
  })
);
