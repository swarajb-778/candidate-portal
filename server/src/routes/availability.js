import { Router } from 'express';
import { Interview } from '../models/index.js';
import { wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';

export const availabilityRoutes = Router();
availabilityRoutes.use(wrap(requireAuth));

// The calendar's selectable range comes from here — never hardcoded in the
// client, which is how the prototype ended up offering September dates for an
// August deadline.
availabilityRoutes.get(
  '/request',
  wrap(async (req, res) => {
    const interview = await Interview.findOne({
      user: req.user._id,
      'availabilityRequest.open': true
    })
      .populate('application', 'slug title team')
      .lean();

    if (!interview) return res.json(null);

    const r = interview.availabilityRequest;
    res.json({
      interviewSlug: interview.slug,
      application: interview.application,
      dueAt: r.dueAt,
      windowStart: r.windowStart,
      windowEnd: r.windowEnd,
      timezone: r.timezone,
      note: r.note
    });
  })
);
