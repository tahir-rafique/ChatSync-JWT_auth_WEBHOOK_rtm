const { body, param, query, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

// ── Run validator chain and collect errors ────────────────
const validate = (validations) => async (req, res, next) => {
  for (const validation of validations) {
    await validation.run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new AppError("Validation failed", 400, formatted));
  }
  next();
};

// ── Auth Validators ────────────────────────────────────────
const registerValidator = validate([
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").optional().trim(),
]);

const loginValidator = validate([
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
]);

const forgotPasswordValidator = validate([
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
]);

const resetPasswordValidator = validate([
  param("token").notEmpty().withMessage("Reset token is required"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
]);

// ── User Validators ────────────────────────────────────────
const searchUsersValidator = validate([
  query("email").optional().trim().isEmail().withMessage("Invalid email format"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be 1-50"),
]);

const mongoIdValidator = (paramName) =>
  validate([param(paramName).isMongoId().withMessage(`Invalid ${paramName}`)]);

// ── Message Validators ────────────────────────────────────
const sendMessageValidator = validate([
  param("conversationId").isMongoId().withMessage("Invalid conversationId"),
  body("content").trim().notEmpty().withMessage("Message content is required").isLength({ max: 5000 }).withMessage("Message too long"),
  body("replyTo").optional().isMongoId().withMessage("Invalid replyTo message ID"),
]);

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  searchUsersValidator,
  mongoIdValidator,
  sendMessageValidator,
};
