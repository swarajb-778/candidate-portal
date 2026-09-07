import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { ApiError } from './error.js';

const COOKIE = 'cp_session';
const TTL_MINUTES = 30;

// `secure` only in production — over plain http://localhost a secure cookie is
// silently dropped and every login looks like it failed.
const cookieOptions = (remember) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  // "Remember me" is the difference between a cookie that survives closing the
  // browser and one that doesn't. The 30-minute token expiry applies either way.
  ...(remember ? { maxAge: TTL_MINUTES * 60 * 1000 } : {})
});

export const issueSession = (res, user, remember = false) => {
  const token = jwt.sign({ sub: String(user._id), remember }, process.env.JWT_SECRET, {
    expiresIn: `${TTL_MINUTES}m`
  });
  res.cookie(COOKIE, token, cookieOptions(remember));
};

export const clearSession = (res) => res.clearCookie(COOKIE, cookieOptions(false));

export const requireAuth = async (req, res, next) => {
  const token = req.cookies?.[COOKIE];
  if (!token) return next(new ApiError(401, 'NO_SESSION', 'Sign in to continue.'));

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(new ApiError(401, 'SESSION_EXPIRED', 'Your session expired.'));
  }

  const user = await User.findById(payload.sub);
  if (!user) return next(new ApiError(401, 'NO_SESSION', 'Sign in to continue.'));

  req.user = user;
  issueSession(res, user, payload.remember === true); // 30-minute sliding expiry
  next();
};
