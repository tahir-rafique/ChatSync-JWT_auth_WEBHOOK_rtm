const User = require("../../../../models/User");
const AppError = require("../../../../utils/AppError");
const asyncHandler = require("../../../../utils/asyncHandler");
const { sendSuccess } = require("../../../../utils/response");

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get currently authenticated user info
 *     responses:
 *       200:
 *         description: Current user profile
 *       404:
 *         description: User not found
 */
const getMe = asyncHandler(async (req, res) => {
    // 1) If not authenticated, return success with null user
    if (!req.user) {
        return sendSuccess(res, { user: null }, "Not authenticated");
    }

    // 2) Find the current user by ID and populate friends
    const user = await User.findById(req.user.id).populate("friends", "name email avatar isOnline lastSeen");

    // 3) Validate user exists in DB
    if (!user) {
        return sendSuccess(res, { user: null }, "User session invalid");
    }

    // 4) Return user details (sanitized with toPublic())
    return sendSuccess(res, { user: user.toPublic() }, "User data retrieved");
});

module.exports = getMe;
