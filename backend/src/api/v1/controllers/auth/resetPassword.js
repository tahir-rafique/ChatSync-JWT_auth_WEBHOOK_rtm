const crypto = require("crypto");
const User = require("../../../../models/User");
const AppError = require("../../../../utils/AppError");
const asyncHandler = require("../../../../utils/asyncHandler");
const { sendSuccess } = require("../../../../utils/response");

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token from email
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
const resetPassword = asyncHandler(async (req, res) => {
    // 1) Hash the incoming reset token to match stored value
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");

    // 2) Find user by hashed token and check expiry
    const user = await User.findOne({
        resetPasswordToken: hashed,
        resetPasswordExpires: { $gt: Date.now() },
    });

    // 3) Handle invalid or expired token
    if (!user) throw new AppError("Invalid or expired reset token", 400);

    // 4) Update user password and clear reset fields
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 5) Return success message
    return sendSuccess(res, null, "Password reset successfully. Please login.");
});

module.exports = resetPassword;
