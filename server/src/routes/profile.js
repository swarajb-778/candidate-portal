import { Router } from 'express';
import {
  personalSchema, linksSchema, preferencesSchema, eeoSchema,
  experienceSchema, educationSchema, skillsSchema, visibilitySchema
} from '@candidate-portal/shared/schemas/profile';

import { Application, Document, User } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { profileStrength } from '../lib/profileStrength.js';

export const profileRoutes = Router();
profileRoutes.use(wrap(requireAuth));

const hasResume = (userId) =>
  Document.exists({ user: userId, kind: 'Resume', deletedAt: { $exists: false } });

// "Active" on the profile card means still in play — which includes Offer.
// (The Applications chip group of the same name deliberately excludes it,
// because that screen has a separate Offer chip.)
const IN_PLAY = ['Draft', 'Submitted', 'Under Review', 'Interview', 'Offer'];

const serialize = async (user) => {
  const json = user.toJSON();
  delete json.passwordHash;

  const [resume, activeApplications] = await Promise.all([
    hasResume(user._id),
    Application.countDocuments({ user: user._id, status: { $in: IN_PLAY } })
  ]);

  json.profileStrength = profileStrength(json, Boolean(resume));
  json.activeApplications = activeApplications;
  return json;
};

const reload = (id) => User.findById(id);

profileRoutes.get('/profile', wrap(async (req, res) => res.json(await serialize(req.user))));

// The design edits one section at a time, so each PATCH carries only that
// section's fields and each is validated by its own schema.
profileRoutes.patch(
  '/profile',
  wrap(async (req, res) => {
    const body = req.body ?? {};
    let update;

    if ('links' in body) update = linksSchema.parse(body);
    else if ('preferences' in body) update = preferencesSchema.parse(body);
    else update = personalSchema.parse(body);

    if (update.email && update.email !== req.user.email) {
      if (await User.exists({ email: update.email, _id: { $ne: req.user._id } })) {
        throw new ApiError(409, 'EMAIL_TAKEN', 'An account already uses that address.', 'email');
      }
    }

    await User.updateOne({ _id: req.user._id }, { $set: update });
    res.json(await serialize(await reload(req.user._id)));
  })
);

// Separate endpoint so it can be audit-logged and access-controlled apart from
// the rest of the profile.
profileRoutes.patch(
  '/profile/eeo',
  wrap(async (req, res) => {
    const eeo = eeoSchema.parse(req.body);
    await User.updateOne({ _id: req.user._id }, { $set: { eeo: { ...eeo, provided: true } } });
    res.json(await serialize(await reload(req.user._id)));
  })
);

// Experience and education are the same shape, so they share one factory.
const repeatable = (field, schema) => {
  profileRoutes.post(
    `/profile/${field}`,
    wrap(async (req, res) => {
      const entry = schema.parse(req.body);
      const user = await reload(req.user._id);
      user[field].push(entry);
      await user.save();
      res.status(201).json(await serialize(user));
    })
  );

  profileRoutes.patch(
    `/profile/${field}/:id`,
    wrap(async (req, res) => {
      const entry = schema.parse(req.body);
      const user = await reload(req.user._id);
      const row = user[field].id(req.params.id);
      if (!row) throw new ApiError(404, 'NOT_FOUND', 'No such entry.');
      row.set(entry);
      await user.save();
      res.json(await serialize(user));
    })
  );

  profileRoutes.delete(
    `/profile/${field}/:id`,
    wrap(async (req, res) => {
      const user = await reload(req.user._id);
      const row = user[field].id(req.params.id);
      if (!row) throw new ApiError(404, 'NOT_FOUND', 'No such entry.');
      row.deleteOne();
      await user.save();
      res.json(await serialize(user));
    })
  );
};

repeatable('experience', experienceSchema);
repeatable('education', educationSchema);

// Chip add/remove replaces the whole array — simpler than per-chip endpoints,
// and the array is tiny.
profileRoutes.put(
  '/profile/skills',
  wrap(async (req, res) => {
    const { skills } = skillsSchema.parse(req.body);
    // Duplicates are silently ignored, case-insensitively.
    const seen = new Set();
    const unique = skills.filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    await User.updateOne({ _id: req.user._id }, { $set: { skills: unique } });
    res.json(await serialize(await reload(req.user._id)));
  })
);

profileRoutes.patch(
  '/visibility',
  wrap(async (req, res) => {
    const { openToOtherRoles } = visibilitySchema.parse(req.body);
    await User.updateOne({ _id: req.user._id }, { $set: { 'visibility.openToOtherRoles': openToOtherRoles } });
    res.json(await serialize(await reload(req.user._id)));
  })
);

// What "Preview as recruiter" renders. The modal's footnote promises that
// self-identification and compensation are never included, so the endpoint is
// what guarantees it — the client is not trusted to hide fields.
profileRoutes.get(
  '/profile/recruiter-view',
  wrap(async (req, res) => {
    const u = await User.findById(req.user._id)
      .select('-eeo -preferences.compensation -settings -visibility')
      .lean({ virtuals: true });

    const activeApplications = await Application.countDocuments({
      user: req.user._id,
      status: { $in: IN_PLAY }
    });

    res.json({
      fullName: `${u.firstName} ${u.lastName}`.trim(),
      initials: ((u.firstName?.[0] ?? '?') + (u.lastName?.[0] ?? '')).toUpperCase(),
      email: u.email,
      phone: u.phone,
      city: u.city,
      pronouns: u.pronouns,
      workAuth: u.workAuth,
      links: u.links,
      preferences: u.preferences,
      experience: u.experience,
      education: u.education,
      skills: u.skills,
      activeApplications
    });
  })
);
