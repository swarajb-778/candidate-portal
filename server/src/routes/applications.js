import { Router } from 'express';
import mongoose from 'mongoose';
import { Application, Interview, Offer } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';

export const applicationRoutes = Router();
applicationRoutes.use(wrap(requireAuth));

// The filter chips. `Hired` rides with the offer group: it shares the success
// pill and it is where a candidate looks for the role they accepted.
const GROUPS = {
  active: ['Draft', 'Submitted', 'Under Review', 'Interview'],
  interview: ['Interview'],
  offer: ['Offer', 'Hired'],
  closed: ['Not Selected', 'Withdrawn']
};

// The pill shows the stage, not the status enum — "PANEL INTERVIEW", not
// "INTERVIEW". README says to derive it from the newest timeline entry, but that
// yields "Moved to Interview"; a scheduled panel day is the more specific truth
// and matches the screenshots, so it wins when one exists.
const stageLabel = (app, interviews) => {
  const iv = interviews.find((i) => String(i.application) === String(app._id));
  if (iv) return iv.kind === 'panel-day' ? 'Panel interview' : 'Interview scheduled';

  const latest = [...(app.timeline ?? [])].sort((a, b) => new Date(b.at) - new Date(a.at))[0];
  if (latest?.title) return latest.title.replace(/^Moved to /i, '');

  return app.status;
};

const upcomingInterviews = (userId) =>
  Interview.find({
    user: userId,
    endsAt: { $gte: new Date() },
    status: { $in: ['Scheduled', 'Reschedule requested'] }
  })
    .select('application kind')
    .lean();

const SORTS = {
  recent: { appliedAt: -1 },
  oldest: { appliedAt: 1 },
  title: { title: 1 }
};

applicationRoutes.get(
  '/',
  wrap(async (req, res) => {
    const { status, sort = 'recent' } = req.query;
    const where = { user: req.user._id };

    if (status && status !== 'all') {
      // Accepts a chip name or an explicit comma-separated status list.
      where.status = { $in: GROUPS[status] ?? String(status).split(',') };
    }

    const [items, all, interviews] = await Promise.all([
      Application.find(where).sort(SORTS[sort] ?? SORTS.recent).lean(),
      Application.find({ user: req.user._id }).select('status').lean(),
      upcomingInterviews(req.user._id)
    ]);

    for (const app of items) app.stageLabel = stageLabel(app, interviews);

    const countIn = (group) => all.filter((a) => GROUPS[group].includes(a.status)).length;

    res.json({
      items,
      counts: {
        all: all.length,
        active: countIn('active'),
        interview: countIn('interview'),
        offer: countIn('offer'),
        closed: countIn('closed')
      }
    });
  })
);

applicationRoutes.get(
  '/:slug',
  wrap(async (req, res) => {
    const application = await Application.findOne({ user: req.user._id, slug: req.params.slug })
      .populate('documents', 'slug name kind sizeBytes mimeType uploadedAt')
      .lean();

    if (!application) throw new ApiError(404, 'NOT_FOUND', 'No such application.');

    // Newest first — the timeline rail reads top-down from the latest event.
    application.timeline = [...(application.timeline ?? [])].sort((a, b) => new Date(b.at) - new Date(a.at));
    application.stageLabel = stageLabel(application, await upcomingInterviews(req.user._id));

    // Just enough of the offer for the status banner to name the deadline.
    const offer = await Offer.findOne({ application: application._id }).select('stage respondByAt').lean();
    if (offer) application.offer = { stage: offer.stage, respondByAt: offer.respondByAt };

    res.json(application);
  })
);

// The confirmation copy promises three things — status change, recruiting
// notified, scheduled interviews cancelled — so all three happen together.
// Atlas is a replica set, so a transaction is available.
applicationRoutes.post(
  '/:slug/withdraw',
  wrap(async (req, res) => {
    const application = await Application.findOne({ user: req.user._id, slug: req.params.slug });
    if (!application) throw new ApiError(404, 'NOT_FOUND', 'No such application.');

    if (['Withdrawn', 'Not Selected', 'Hired'].includes(application.status)) {
      throw new ApiError(409, 'ALREADY_CLOSED', 'This application is already closed.');
    }

    const now = new Date();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        application.status = 'Withdrawn';
        application.withdrawnAt = now;
        application.closedAt = now;
        application.closeNote = `You withdrew this application on ${now.toISOString().slice(0, 10)}. Recruiting was notified.`;
        application.timeline.push({
          at: now,
          title: 'Application withdrawn',
          text: req.body?.reason?.trim() || 'You withdrew this application.',
          tone: 'neutral'
        });
        await application.save({ session });

        await Interview.updateMany(
          { user: req.user._id, application: application._id, status: 'Scheduled' },
          { $set: { status: 'Cancelled' } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    res.json(application.toJSON());
  })
);
