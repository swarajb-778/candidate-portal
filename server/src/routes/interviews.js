import { Router } from 'express';
import { Interview } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';

export const interviewRoutes = Router();
interviewRoutes.use(wrap(requireAuth));

const withApplication = (q) => q.populate('application', 'slug title team location');

interviewRoutes.get(
  '/',
  wrap(async (req, res) => {
    const now = new Date();
    const upcoming = (req.query.tab ?? 'upcoming') !== 'past';

    const where = upcoming
      ? { user: req.user._id, endsAt: { $gte: now }, status: { $in: ['Scheduled', 'Reschedule requested'] } }
      : { user: req.user._id, $or: [{ endsAt: { $lt: now } }, { status: { $in: ['Completed', 'Cancelled'] } }] };

    // A panel day comes back as one interview with a sessions[] array — never
    // flattened to one interview per session; the UI groups them.
    const items = await withApplication(Interview.find(where))
      .sort({ startsAt: upcoming ? 1 : -1 })
      .lean();

    res.json({ items });
  })
);

interviewRoutes.get(
  '/:slug',
  wrap(async (req, res) => {
    const interview = await withApplication(
      Interview.findOne({ user: req.user._id, slug: req.params.slug })
    ).lean();

    if (!interview) throw new ApiError(404, 'NOT_FOUND', 'No such interview.');

    // joinUrl is handed out by /join inside the unlock window only.
    delete interview.joinUrl;
    res.json(interview);
  })
);

// The 15-minute rule is a real access control, not a hidden button.
interviewRoutes.get(
  '/:slug/join',
  wrap(async (req, res) => {
    const interview = await Interview.findOne({ user: req.user._id, slug: req.params.slug });
    if (!interview) throw new ApiError(404, 'NOT_FOUND', 'No such interview.');

    const unlocksAt = new Date(
      interview.startsAt.getTime() - (interview.joinUnlockMinutesBefore ?? 15) * 60_000
    );

    if (Date.now() < unlocksAt.getTime()) {
      return res.status(403).json({
        error: { code: 'TOO_EARLY', message: 'The join link is not open yet.' },
        unlocksAt
      });
    }

    res.json({ joinUrl: interview.joinUrl });
  })
);

interviewRoutes.patch(
  '/:slug/prep/:itemId',
  wrap(async (req, res) => {
    const interview = await Interview.findOne({ user: req.user._id, slug: req.params.slug });
    if (!interview) throw new ApiError(404, 'NOT_FOUND', 'No such interview.');

    const item = interview.prepChecklist.id(req.params.itemId);
    if (!item) throw new ApiError(404, 'NOT_FOUND', 'No such checklist item.');

    item.done = Boolean(req.body?.done);
    await interview.save();

    res.json({ itemId: item._id, done: item.done });
  })
);
