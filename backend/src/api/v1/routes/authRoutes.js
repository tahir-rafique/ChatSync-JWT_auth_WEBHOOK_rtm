const express = require("express");
const router = express.Router();

const register = require("../controllers/auth/register");
const login = require("../controllers/auth/login");
const logout = require("../controllers/auth/logout");
const refreshToken = require("../controllers/auth/refreshToken");
const forgotPassword = require("../controllers/auth/forgotPassword");
const resetPassword = require("../controllers/auth/resetPassword");
const getMe = require("../controllers/auth/getMe");

const { protect, optionalAuth } = require("../../../middlewares/auth");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../../../middlewares/validate");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.get("/me", optionalAuth, getMe);
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/logout", optionalAuth, logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidator, resetPassword);

module.exports = router;
