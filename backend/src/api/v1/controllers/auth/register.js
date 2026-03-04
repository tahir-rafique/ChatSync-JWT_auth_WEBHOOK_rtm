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
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // 1) Check if email is already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError("Email already registered", 400);

    // 2) Create new user
    const user = await User.create({ name, email: email.toLowerCase(), password, phone });

    // 3) Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 4) Store refresh token in user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 5) Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    // 6) Send response
    return sendSuccess(res, { user: user.toPublic(), accessToken }, "Registered successfully", 201);
});

module.exports = register;
