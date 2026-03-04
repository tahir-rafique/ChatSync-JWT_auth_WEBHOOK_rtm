const User = require("../../../../models/User");
const {
    generateResetToken,
    sendPasswordResetEmail,
} = require("../../../../services/authService");
const asyncHandler = require("../../../../utils/asyncHandler");
const { sendSuccess } = require("../../../../utils/response");

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send password reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Success message regardless of email existence (to prevent enum)
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // 1) Handle case where user is not found
    if (!user) {
        return sendSuccess(res, null, "If that email exists, a reset link has been sent.");
    }

    // 2) Generate reset token (raw and hashed)
    const { raw, hashed } = generateResetToken();
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save({ validateBeforeSave: false });

    // 3) Construct reset URL and send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${raw}`;
    await sendPasswordResetEmail(user, resetUrl);

    // 4) Return success to client
    return sendSuccess(res, null, "If that email exists, a reset link has been sent.");
});

module.exports = forgotPassword;
