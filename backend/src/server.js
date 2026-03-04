require("dotenv").config();

// ── Verify Required ENV ───────────────────────────────
const requiredEnv = ["JWT_SECRET", "JWT_REFRESH_SECRET", "MONGODB_URI"];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ CRITICAL ERROR: Missing environment variables: ${missing.join(", ")}`);
  console.error(`📌 Check your backend/.env file and ensure it exists in the CWD.`);
  process.exit(1);
}

const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { initWebSocket } = require("./websocket/wsServer");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// ── Init WebSocket ────────────────────────────────────────
initWebSocket(server);

// ── Start Server ──────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📚 Swagger docs → http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

// ── Graceful Shutdown ─────────────────────────────────────
process.on("SIGTERM", () => {
  logger.info("SIGTERM received – shutting down gracefully");
  server.close(() => process.exit(0));
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
