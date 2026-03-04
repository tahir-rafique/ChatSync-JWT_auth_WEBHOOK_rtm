const User = require("../../../../models/User");
const { clearAuthCookies } = require("../../../../services/authService");
const asyncHandler = require("../../../../utils/asyncHandler");
const { sendSuccess } = require("../../../../utils/response");

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
const logout = asyncHandler(async (req, res) => {
    // 1) Find the user and set offline state if authenticated
    if (req.user) {
        const user = await User.findById(req.user.id);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            user.refreshToken = null;
            await user.save({ validateBeforeSave: false });
        }
    }

    // 2) Clear cookies and send success response
    clearAuthCookies(res);
    return sendSuccess(res, null, "Logged out successfully");
});

module.exports = logout;
