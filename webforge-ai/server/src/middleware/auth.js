import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { env } from '../config/env.js';

/** Requires a valid JWT (from cookie or Authorization header) and attaches req.user. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const cookieToken = req.cookies?.[env.JWT_COOKIE_NAME];
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  // Prefer the explicit bearer token so a stale cookie cannot override a new
  // session token used by static hosts where cross-site cookies are blocked.
  const token = headerToken || cookieToken;

  if (!token) throw ApiError.unauthorized('Authentication required');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  // select +byokKeyEncrypted so aiController can decrypt it for BYOK requests;
  // toJSON() strips it again before anything is ever sent back to the client.
  const user = await User.findById(payload.sub).select('+byokKeyEncrypted');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  if (req.user?.role !== 'admin') throw ApiError.forbidden('Admin access required');
  next();
});
