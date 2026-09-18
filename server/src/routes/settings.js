import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  passwordSchema, notificationChannelsSchema, preferencesSettingsSchema, deleteAccountSchema
} from '@candidate-portal/shared/schemas/settings';

import { Application, Interview, User } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth, clearSession } from '../middleware/auth.js';

export const settingsRoutes = Router();
settingsRoutes.use(wrap(requireAuth));

settingsRoutes.patch(
  '/settings',
  wrap(async (req, res) => {
    const patch = preferencesSettingsSchema.parse(req.body);
    const $set = Object.fromEntries(Object.entries(patch).map(([k, v]) => [`settings.${k}`, v]));
    await User.updateOne({ _id: req.user._id }, { $set });
    res.json((await User.findById(req.user._id)).toJSON());
  })
);

// Deep partial — the UI toggles one switch at a time. Interview invitations by
// email can never be turned off; the UI renders that switch as non-interactive
// and the server refuses the change regardless.
settingsRoutes.patch(
  '/settings/notifications',
  wrap(async (req, res) => {
    if (req.body?.interview?.email === false) {
      throw new ApiError(
        400,
        'CHANNEL_LOCKED',
        'Interview invitations are always sent by email.',
        'interview.email'
      );
    }

    const patch = notificationChannelsSchema.parse(req.body);
    const $set = {};
    for (const [row, channels] of Object.entries(patch)) {
      for (const [channel, value] of Object.entries(channels ?? {})) {
        if (value !== undefined) $set[`settings.notifications.${row}.${channel}`] = value;
      }
    }

    await User.updateOne({ _id: req.user._id }, { $set });
    res.json((await User.findById(req.user._id)).toJSON());
  })
);

settingsRoutes.post(
  '/password',
  wrap(async (req, res) => {
    const { current, next } = passwordSchema.parse(req.body);

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await bcrypt.compare(current, user.passwordHash))) {
      throw new ApiError(422, 'WRONG_PASSWORD', 'That password is not correct.', 'current');
    }

    user.passwordHash = await bcrypt.hash(next, 10);
    user.passwordChangedAt = new Date();
    // Other devices are revoked; this session survives.
    user.devices = user.devices.filter((d) => d.current);
    await user.save();

    res.json({ ok: true, passwordChangedAt: user.passwordChangedAt });
  })
);

settingsRoutes.patch(
  '/two-factor',
  wrap(async (req, res) => {
    const enabled = Boolean(req.body?.enabled);
    await User.updateOne({ _id: req.user._id }, { $set: { 'settings.twoFactor': enabled } });
    res.json({ enabled });
  })
);

settingsRoutes.get(
  '/sessions',
  wrap(async (req, res) => res.json({ items: req.user.devices ?? [] }))
);

settingsRoutes.delete(
  '/sessions/:id',
  wrap(async (req, res) => {
    const user = await User.findById(req.user._id);
    const device = user.devices.find((d) => d.key === req.params.id);
    if (!device) throw new ApiError(404, 'NOT_FOUND', 'No such device.');
    // The UI hides the button on your own row; the server refuses anyway.
    if (device.current) throw new ApiError(403, 'FORBIDDEN', 'You cannot sign out the device you are using.');

    user.devices = user.devices.filter((d) => d.key !== req.params.id);
    await user.save();
    res.status(204).end();
  })
);

// Export is a job so the card has a real preparing state. In-memory is enough
// for a fixed corpus — nothing here needs to survive a restart.
const exportJobs = new Map();
const EXPORT_MS = 4000;

settingsRoutes.post(
  '/export',
  wrap(async (req, res) => {
    const jobId = randomUUID();
    exportJobs.set(jobId, { user: String(req.user._id), readyAt: Date.now() + EXPORT_MS });
    res.status(202).json({ jobId });
  })
);

settingsRoutes.get(
  '/export/:jobId',
  wrap(async (req, res) => {
    const job = exportJobs.get(req.params.jobId);
    if (!job || job.user !== String(req.user._id)) throw new ApiError(404, 'NOT_FOUND', 'No such export.');

    if (Date.now() < job.readyAt) return res.json({ state: 'pending' });

    res.json({
      state: 'ready',
      url: `/api/v1/me/export/${req.params.jobId}/download`,
      sizeBytes: 5033164,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
    });
  })
);

settingsRoutes.delete(
  '/',
  wrap(async (req, res) => {
    deleteAccountSchema.parse(req.body);
    const id = req.user._id;
    const now = new Date();

    await Application.updateMany(
      { user: id, status: { $in: ['Draft', 'Submitted', 'Under Review', 'Interview', 'Offer'] } },
      { $set: { status: 'Withdrawn', withdrawnAt: now, closedAt: now } }
    );
    await Interview.updateMany({ user: id, status: 'Scheduled' }, { $set: { status: 'Cancelled' } });

    // Retained records are anonymised rather than deleted — equal-opportunity
    // reporting needs them for two years.
    await User.updateOne(
      { _id: id },
      {
        $set: {
          email: `deleted-${id}@example.invalid`,
          firstName: 'Deleted', lastName: 'Account',
          phone: '', city: '', pronouns: '',
          links: {}, skills: [], experience: [], education: [],
          eeo: { provided: false, gender: 'Prefer not to say', veteran: 'Prefer not to say', disability: 'Prefer not to say' },
          devices: []
        }
      }
    );

    clearSession(res);
    res.status(204).end();
  })
);
