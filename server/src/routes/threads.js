import { Router } from 'express';
import { Message, Thread } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';

export const threadRoutes = Router();
threadRoutes.use(wrap(requireAuth));

threadRoutes.get(
  '/',
  wrap(async (req, res) => {
    const items = await Thread.find({ user: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate('application', 'slug title team')
      .lean();

    // Both the thread list and the Overview card show a one-line preview of the
    // latest message, so it ships with the list rather than in N follow-ups.
    const latest = await Message.aggregate([
      { $match: { thread: { $in: items.map((t) => t._id) } } },
      { $sort: { sentAt: -1 } },
      { $group: { _id: '$thread', body: { $first: '$body' }, sentAt: { $first: '$sentAt' } } }
    ]);
    const byThread = new Map(latest.map((m) => [String(m._id), m]));
    for (const t of items) t.lastMessagePreview = byThread.get(String(t._id))?.body ?? '';

    res.json({
      items,
      // The sidebar badge counts threads with unread messages, not messages —
      // two unread threads read as "2" in the design, not "4".
      unreadCount: items.filter((t) => (t.unreadCount ?? 0) > 0).length
    });
  })
);

const findThread = async (userId, slug) => {
  const thread = await Thread.findOne({ user: userId, slug });
  if (!thread) throw new ApiError(404, 'NOT_FOUND', 'No such conversation.');
  return thread;
};

// Oldest-first within a page; `before` walks backwards through history. The
// client groups by calendar day into the date separators.
threadRoutes.get(
  '/:slug/messages',
  wrap(async (req, res) => {
    const thread = await findThread(req.user._id, req.params.slug);
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const where = { thread: thread._id };
    if (req.query.before) where.sentAt = { $lt: new Date(req.query.before) };

    // Take the newest `limit` before the cursor, then flip to oldest-first.
    const page = await Message.find(where).sort({ sentAt: -1 }).limit(limit).lean();
    page.reverse();

    res.json({
      items: page,
      hasMore: page.length === limit,
      thread: {
        slug: thread.slug,
        participant: thread.participant,
        application: await thread.populate('application', 'slug title team').then((t) => t.application)
      }
    });
  })
);

threadRoutes.post(
  '/:slug/messages',
  wrap(async (req, res) => {
    const body = String(req.body?.body ?? '').trim();
    if (!body) throw new ApiError(400, 'EMPTY_MESSAGE', 'Write something first.', 'body');

    const thread = await findThread(req.user._id, req.params.slug);
    const message = await Message.create({ thread: thread._id, fromCandidate: true, body });

    thread.lastMessageAt = message.sentAt;
    await thread.save();

    res.status(201).json(message.toJSON());
  })
);

// Fired on thread open.
threadRoutes.post(
  '/:slug/read',
  wrap(async (req, res) => {
    const thread = await findThread(req.user._id, req.params.slug);
    thread.unreadCount = 0;
    await thread.save();
    res.status(204).end();
  })
);
