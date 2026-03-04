const express = require("express");
const router = express.Router();

const {
  getConversations,
  getConversationById,
  startConversation,
  getMessages,
  sendMessage,
  sendFileMessage,
  deleteMessage,
} = require("../controllers/chatController");

const { protect } = require("../../../middlewares/auth");
const { sendMessageValidator, mongoIdValidator } = require("../../../middlewares/validate");
const upload = require("../../../config/multer");

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat conversations and messages
 */

router.use(protect);

// Conversations
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId", mongoIdValidator("conversationId"), getConversationById);
router.post("/conversations/start/:friendId", mongoIdValidator("friendId"), startConversation);

// Messages
router.get("/conversations/:conversationId/messages", mongoIdValidator("conversationId"), getMessages);
router.post("/conversations/:conversationId/messages", sendMessageValidator, sendMessage);
router.post(
  "/conversations/:conversationId/upload",
  mongoIdValidator("conversationId"),
  upload.single("file"),
  sendFileMessage
);
router.delete("/messages/:messageId", mongoIdValidator("messageId"), deleteMessage);

module.exports = router;
