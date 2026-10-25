import User from '../models/User.js';
import { encryptSecret } from '../utils/crypto.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  if (name !== undefined) req.user.name = name;
  if (avatar !== undefined) req.user.avatar = avatar;
  await req.user.save();
  res.json({ success: true, data: { user: req.user } });
});

export const setByokKey = asyncHandler(async (req, res) => {
  if (!env.ALLOW_BYOK) throw ApiError.forbidden('Bring-your-own-key is disabled on this server.');
  const { provider, apiKey } = req.body;
  if (!['openai', 'anthropic'].includes(provider)) throw ApiError.badRequest('provider must be "openai" or "anthropic".');
  if (!apiKey || apiKey.length < 10) throw ApiError.badRequest('A valid API key is required.');

  req.user.byokProvider = provider;
  req.user.byokKeyEncrypted = encryptSecret(apiKey);
  await req.user.save();

  res.json({ success: true, message: `${provider} key saved. It will be used for your AI generations.` });
});

export const clearByokKey = asyncHandler(async (req, res) => {
  req.user.byokProvider = null;
  req.user.byokKeyEncrypted = null;
  await req.user.save();
  res.json({ success: true, message: 'BYOK key removed. Using the server-configured provider again.' });
});
