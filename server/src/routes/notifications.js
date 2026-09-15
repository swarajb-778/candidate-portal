import { Router } from 'express';
import { Notification } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationRoutes = Router();
notificationRoutes.use(wrap(requireAuth));

const KIND_BY_FILTER = {
  interview: 'interview',
  message: 'message',
  document: 'document',
  application: 'application'
};

// The header bell and the Notification Center share this one query — there is
// deliberately no separate "recent notifications" endpoint.
notificationRoutes.get(
  '/',
  wrap(async (req, res) => {
    const filter = req.query.filter ?? 'all';
    const base = { user: req.user._id, dismissedAt: null };

    const where = { ...base };
    if (filter === 'unread') where.readAt = null;
    else if (KIND_BY_FILTER[filter]) where.kind = KIND_BY_FILTER[filter];

    const [items, unreadCount] = await Promise.all([
      Notification.find(where).sort({ createdAt: -1 }).lean(),
      Notification.countDocuments({ ...base, readAt: null })
    ]);

    res.json({ items, unreadCount });
  })
);

notificationRoutes.post(
  '/read-all',
  wrap(async (req, res) => {
    await Notification.updateMany(
      { user: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.status(204).end();
  })
);

// Fired when a notification's CTA is clicked.
notificationRoutes.post(
  '/:slug/read',
  wrap(async (req, res) => {
    const n = await Notification.findOneAndUpdate(
      { user: req.user._id, slug: req.params.slug },
      { $set: { readAt: new Date() } },
      { new: true }
    ).lean();

    if (!n) throw new ApiError(404, 'NOT_FOUND', 'No such notification.');
    res.json(n);
  })
);

notificationRoutes.delete(
  '/:slug',
  wrap(async (req, res) => {
    const n = await Notification.findOneAndUpdate(
      { user: req.user._id, slug: req.params.slug },
      { $set: { dismissedAt: new Date() } }
    );

    if (!n) throw new ApiError(404, 'NOT_FOUND', 'No such notification.');
    res.status(204).end();
  })
);
