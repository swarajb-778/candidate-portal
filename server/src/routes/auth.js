import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { loginSchema, forgotPasswordSchema, signupSchema } from '@candidate-portal/shared/schemas/auth';

import { User } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth, issueSession, clearSession } from '../middleware/auth.js';

export const authRoutes = Router();

// The design shows one generic message for both a bad address and a bad
// password — never "no such user".
const BAD_CREDENTIALS = 'That email and password don’t match an account.';

authRoutes.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password, remember } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+passwordHash');
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw new ApiError(401, 'BAD_CREDENTIALS', BAD_CREDENTIALS);

    issueSession(res, user, remember);
    res.json({ user: publicUser(user) });
  })
);

authRoutes.post(
  '/signup',
  wrap(async (req, res) => {
    const input = signupSchema.parse(req.body);

    if (await User.exists({ email: input.email })) {
      throw new ApiError(409, 'EMAIL_TAKEN', 'An account already uses that address.', 'email');
    }

    const { password, targetRole, ...rest } = input;
    const user = await User.create({
      ...rest,
      passwordHash: await bcrypt.hash(password, 10),
      preferences: { targetRole: targetRole ?? '' },
      passwordChangedAt: new Date()
    });

    issueSession(res, user, false);
    res.status(201).json({ user: publicUser(user) });
  })
);

authRoutes.post('/logout', (req, res) => {
  clearSession(res);
  res.status(204).end();
});

// Always 204, whether or not the address exists — the "check your inbox" screen
// must not leak account existence.
authRoutes.post(
  '/forgot-password',
  wrap(async (req, res) => {
    forgotPasswordSchema.parse(req.body);
    res.status(204).end();
  })
);

authRoutes.get(
  '/me',
  wrap(requireAuth),
  wrap(async (req, res) => res.json({ user: publicUser(req.user) }))
);

// Stubbed while the corpus is seeded: signs in the canonical account. The
// endpoint stays real so the buttons aren't decoration.
authRoutes.post(
  '/sso/:provider',
  wrap(async (req, res) => {
    if (!['google', 'linkedin'].includes(req.params.provider)) {
      throw new ApiError(404, 'UNKNOWN_PROVIDER', 'Unknown sign-in provider.');
    }
    const user = await User.findOne({ email: 'swaraj@example.com' });
    if (!user) throw new ApiError(401, 'BAD_CREDENTIALS', BAD_CREDENTIALS);

    issueSession(res, user, true);
    res.json({ user: publicUser(user) });
  })
);

function publicUser(user) {
  const { passwordHash, ...rest } = user.toJSON();
  return rest;
}
