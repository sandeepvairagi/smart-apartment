/**
 * Async wrapper — catches errors in async route handlers
 * so we don't need try/catch in every controller method.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
