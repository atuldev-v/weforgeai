/**
 * Minimal structured logger. Never logs secrets (passwords, tokens, API keys) —
 * callers are responsible for not passing sensitive fields in, and the redact()
 * helper below strips common secret field names defensively.
 */
const SECRET_KEYS = new Set([
  'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
  'apiKey', 'openaiApiKey', 'anthropicApiKey', 'githubToken', 'secret', 'jwt',
]);

function redact(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  const out = Array.isArray(meta) ? [] : {};
  for (const [k, v] of Object.entries(meta)) {
    if (SECRET_KEYS.has(k)) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      out[k] = redact(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function line(level, msg, meta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(meta ? { meta: redact(meta) } : {}),
  };
  const serialized = JSON.stringify(entry);
  if (level === 'error') console.error(serialized);
  else if (level === 'warn') console.warn(serialized);
  else console.log(serialized);
}

export const logger = {
  info: (msg, meta) => line('info', msg, meta),
  warn: (msg, meta) => line('warn', msg, meta),
  error: (msg, err) => line('error', msg, err instanceof Error ? { message: err.message, stack: err.stack } : err),
};
