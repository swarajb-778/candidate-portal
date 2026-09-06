import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(status, code, message, field) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export const notFound = (req, res, next) =>
  next(new ApiError(404, 'NOT_FOUND', `No route for ${req.method} ${req.originalUrl}`));

// Every failure leaves as { error: { code, message, field } } — `field` is what
// lets React Hook Form call setError(field, …) directly.
export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({
      error: { code: 'VALIDATION', message: first.message, field: first.path.join('.') }
    });
  }

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message, field: err.field } });
  }

  // Duplicate key — the only Mongo error the UI can act on.
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0];
    return res.status(409).json({
      error: { code: 'DUPLICATE', message: 'That value is already in use.', field }
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { code: 'SERVER_ERROR', message: 'Something went wrong on our side.' }
  });
};

// Wraps an async handler so a rejection reaches errorHandler instead of hanging.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
