const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

module.exports = { connectDB, disconnectDB };
