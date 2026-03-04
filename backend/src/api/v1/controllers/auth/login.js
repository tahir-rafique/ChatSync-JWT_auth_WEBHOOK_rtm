const User = require("../../../../models/User");
const {
    generateAccessToken,
    generateRefreshToken,
    setAuthCookies,
} = require("../../../../services/authService");
const AppError = require("../../../../utils/AppError");
const asyncHandler = require("../../../../utils/asyncHandler");
const { sendSuccess } = require("../../../../utils/response");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email & password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1) Find user by email and select password (as select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // 2) Validate user and compare password
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError("Invalid email or password", 401);
    }

    // 3) Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 4) Update user state
    user.refreshToken = refreshToken;
    user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    // 5) Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    // 6) Send response
    return sendSuccess(res, { user: user.toPublic(), accessToken }, "Login successful");
});

module.exports = login;
