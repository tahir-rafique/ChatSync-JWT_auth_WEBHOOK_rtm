const { verifyToken } = require("../services/authService");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// ── Protect Route (JWT required) ──────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1) Check Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2) Fallback to cookie
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw new AppError("Authentication required. Please login.", 401);

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).select("_id name email role");
  if (!user) throw new AppError("User no longer exists", 401);

  req.user = user;
  next();
});

// ── Optional Auth (won't fail if no token) ────────────────
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.cookies?.accessToken;

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("_id name email");
      if (user) req.user = user;
    }
  } catch (_) {
    // Silently fail — optional
  }
  next();
};

module.exports = { protect, optionalAuth };
