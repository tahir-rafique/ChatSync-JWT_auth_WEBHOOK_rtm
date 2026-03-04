// ── asyncHandler.js ───────────────────────────────────────
// Wraps async route handlers to catch errors and forward to Express error middleware
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
