const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// ── Generate Access Token ─────────────────────────────────
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Generate Refresh Token ────────────────────────────────
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

// ── Verify Token ──────────────────────────────────────────
const verifyToken = (token, secret = process.env.JWT_SECRET) =>
  jwt.verify(token, secret);

// ── Generate Reset Token ──────────────────────────────────
const generateResetToken = () => {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
};

// ── Nodemailer Transporter ────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Send Email ────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent: ${info.messageId}`);
  return info;
};

// ── Password Reset Email Template ─────────────────────────
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#4F46E5">Password Reset Request</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" 
         style="display:inline-block;background:#4F46E5;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;margin:16px 0">
        Reset Password
      </a>
      <p style="color:#666;font-size:13px">This link expires in <strong>15 minutes</strong>.</p>
      <p style="color:#666;font-size:13px">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: "ChatApp – Password Reset", html });
};

// ── Set Auth Cookies ──────────────────────────────────────
const setAuthCookies = (res, accessToken, refreshToken) => {
  const secure = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateResetToken,
  sendEmail,
  sendPasswordResetEmail,
  setAuthCookies,
  clearAuthCookies,
};
