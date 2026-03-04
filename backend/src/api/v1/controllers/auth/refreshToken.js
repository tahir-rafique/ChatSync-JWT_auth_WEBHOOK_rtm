const User = require("../../../../models/User");
const {
    verifyToken,
    generateAccessToken,
    generateRefreshToken,
    setAuthCookies,
} = require("../../../../services/authService");
const AppError = require("../../../../utils/AppError");
const asyncHandler = require("../../../../utils/asyncHandler");
const { sendSuccess } = require("../../../../utils/response");

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Refresh token required or invalid
 */
const refreshToken = asyncHandler(async (req, res) => {
    // 1) Get token from cookies or body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new AppError("Refresh token required", 401);

    // 2) Verify refresh token
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);

    // 3) Find user by ID and verify stored token matches
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) throw new AppError("Invalid refresh token", 401);

    // 4) Generate new set of tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // 5) Update user with new refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // 6) Update cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    // 7) Send response
    return sendSuccess(res, { accessToken: newAccessToken }, "Token refreshed successfully");
});

module.exports = refreshToken;
