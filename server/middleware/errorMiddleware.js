const sanitizeBody = (value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeBody(item));
  if (typeof value !== 'object') return value;

  return Object.entries(value).reduce((acc, [key, entryValue]) => {
    if (['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'cookie', 'cookies'].includes(key.toLowerCase())) {
      acc[key] = '[REDACTED]';
      return acc;
    }

    acc[key] = sanitizeBody(entryValue);
    return acc;
  }, {});
};

export const errorHandler = (err, req, res, next) => {
  const isAuthRoute = req.path.startsWith('/auth') || req.originalUrl.includes('/auth');

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ...(isAuthRoute ? {} : { body: sanitizeBody(req.body) })
  });

  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};
