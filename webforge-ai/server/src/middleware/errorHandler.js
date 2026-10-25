import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // Always log full detail server-side; never leak stack traces to the client.
  logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);

  const body = {
    success: false,
    message: statusCode >= 500 ? 'Something went wrong. Please try again.' : err.message,
  };
  if (err.details) body.details = err.details;
  if (env.NODE_ENV !== 'production' && statusCode >= 500) {
    body.debug = { message: err.message };
  }

  res.status(statusCode).json(body);
}
