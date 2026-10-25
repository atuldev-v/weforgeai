import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

/** Runs after express-validator chains; turns validation failures into a 400 ApiError. */
export function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw ApiError.badRequest('Validation failed', result.array().map((e) => ({ field: e.path, message: e.msg })));
  }
  next();
}
