import dotenv from 'dotenv';
dotenv.config();

const serverUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5100';

function bool(val, fallback = false) {
  if (val === undefined) return fallback;
  return String(val).toLowerCase() === 'true';
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5100),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SERVER_URL: serverUrl,

  MONGODB_URI: process.env.MONGODB_URI || '',

  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || 'webforge_token',
  PASSWORD_RESET_TOKEN_TTL_MIN: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MIN || 30),

  AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4.1',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
  ALLOW_BYOK: bool(process.env.ALLOW_BYOK, true),

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || `${serverUrl}/api/github/callback`,

  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'WebForge AI <no-reply@webforge.dev>',

  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  AI_RATE_LIMIT_MAX: Number(process.env.AI_RATE_LIMIT_MAX || 30),
};

export function assertRequiredEnv() {
  const missing = [];
  if (env.NODE_ENV === 'production') {
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 16) missing.push('JWT_SECRET (>=16 chars)');
    if (!env.MONGODB_URI) missing.push('MONGODB_URI');
  }
  if (missing.length) {
    throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
  }
  if (!env.JWT_SECRET) {
    // Dev-only fallback so the app is runnable out of the box; never do this in prod.
    env.JWT_SECRET = 'dev_insecure_secret_do_not_use_in_production_' + Math.random().toString(36).slice(2);
    // eslint-disable-next-line no-console
    console.warn('[config] JWT_SECRET not set — using an ephemeral dev secret. Set JWT_SECRET in .env for real use.');
  }
}
