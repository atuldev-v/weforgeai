import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { hashPassword, comparePassword, isPasswordStrong } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { generateRandomToken, hashToken } from '../utils/crypto.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService.js';

function setAuthCookie(res, token) {
  res.cookie(env.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!isPasswordStrong(password)) {
    throw ApiError.badRequest('Password must be at least 8 characters and include a letter and a number.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const passwordHash = await hashPassword(password);
  const emailVerificationToken = generateRandomToken();

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    emailVerificationToken: hashToken(emailVerificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendVerificationEmail(user, emailVerificationToken);

  const token = signToken({ sub: user._id.toString() });
  setAuthCookie(res, token);

  res.status(201).json({ success: true, data: { user, token } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password.');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password.');

  const token = signToken({ sub: user._id.toString() });
  setAuthCookie(res, token);

  const safeUser = user.toJSON();
  res.json({ success: true, data: { user: safeUser, token } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.JWT_COOKIE_NAME);
  res.json({ success: true, message: 'Logged out.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond success to avoid leaking which emails are registered.
  if (user) {
    const rawToken = generateRandomToken();
    await PasswordResetToken.create({
      user: user._id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MIN * 60 * 1000),
    });
    await sendPasswordResetEmail(user, rawToken);
  }

  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!isPasswordStrong(password)) {
    throw ApiError.badRequest('Password must be at least 8 characters and include a letter and a number.');
  }

  const tokenHash = hashToken(token);
  const record = await PasswordResetToken.findOne({ tokenHash, used: false, expiresAt: { $gt: new Date() } });
  if (!record) throw ApiError.badRequest('This reset link is invalid or has expired.');

  const user = await User.findById(record.user);
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired.');

  user.passwordHash = await hashPassword(password);
  await user.save();

  record.used = true;
  await record.save();

  res.json({ success: true, message: 'Password has been reset. You can now log in.' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken');

  if (!user) throw ApiError.badRequest('This verification link is invalid or has expired.');

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  res.json({ success: true, message: 'Email verified.' });
});
