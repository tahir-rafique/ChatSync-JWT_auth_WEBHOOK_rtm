const Conversation = require("../../../models/Conversation");
const Message = require("../../../models/Message");
const User = require("../../../models/User");
const AppError = require("../../../utils/AppError");
const asyncHandler = require("../../../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../../../utils/response");
const { getWss, broadcastToConversation } = require("../../../websocket/wsServer");

// ── Helper: get or create 1-on-1 conversation ────────────
const getOrCreateConversation = async (userId, friendId) => {
  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [userId, friendId], $size: 2 },
  });
  if (!conversation) {
    conversation = await Conversation.create({ participants: [userId, friendId], isGroup: false });
  }
  return conversation;
};

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     tags: [Chat]
 *     summary: Get all conversations for current user (friends only)
 *     responses:
 *       200:
 *         description: Conversations list
 */
const getConversations = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("friends");

  const conversations = await Conversation.find({
    participants: req.user.id,
    $or: [
      { isGroup: true },
      { participants: { $in: currentUser.friends } }, // Only friends for DM
    ],
  })
    .populate("participants", "name email avatar isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatar" },
    })
    .sort({ updatedAt: -1 })
    .lean();

  return sendSuccess(res, { conversations }, "Conversations fetched");
});

/**
 * @swagger
 * /chat/conversations/{conversationId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get single conversation by ID
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation data
 */
const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user.id,
  })
    .populate("participants", "name email avatar isOnline lastSeen")
    .populate({ path: "lastMessage", populate: { path: "sender", select: "name avatar" } });

  if (!conversation) throw new AppError("Conversation not found", 404);
  return sendSuccess(res, { conversation }, "Conversation fetched");
});

/**
 * @swagger
 * /chat/conversations/start/{friendId}:
 *   post:
 *     tags: [Chat]
 *     summary: Start or get DM conversation with a friend
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation started
 */
const startConversation = asyncHandler(async (req, res) => {
  const { friendId } = req.params;

  const currentUser = await User.findById(req.user.id).select("friends");
  const isFriend = currentUser.friends.map((f) => f.toString()).includes(friendId);
  if (!isFriend) throw new AppError("You can only chat with friends", 403);

  const conversation = await getOrCreateConversation(req.user.id, friendId);
  const populated = await conversation.populate("participants", "name email avatar isOnline lastSeen");

  return sendSuccess(res, { conversation: populated }, "Conversation ready");
});

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get messages in a conversation (paginated)
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Messages
 */
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user.id });
  if (!conversation) throw new AppError("Conversation not found", 404);

  const [messages, total] = await Promise.all([
    Message.find({ conversationId, isDeleted: false })
      .populate("sender", "name avatar")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ conversationId, isDeleted: false }),
  ]);

  // Mark as read
  await Message.updateMany(
    { conversationId, "readBy.user": { $ne: req.user.id } },
    { $addToSet: { readBy: { user: req.user.id } } }
  );

  return sendPaginated(res, messages.reverse(), total, page, limit, "Messages fetched");
});

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   post:
 *     tags: [Chat]
 *     summary: Send a text message
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *               replyTo: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, replyTo } = req.body;

  const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user.id });
  if (!conversation) throw new AppError("Conversation not found", 404);

  const message = await Message.create({
    conversationId,
    sender: req.user.id,
    type: "text",
    content,
    replyTo: replyTo || null,
  });

  await message.populate("sender", "name avatar");
  if (replyTo) await message.populate("replyTo");

  // Update conversation's last message
  conversation.lastMessage = message._id;
  conversation.updatedAt = new Date();
  await conversation.save();

  // Broadcast via WebSocket
  broadcastToConversation(conversationId, { type: "NEW_MESSAGE", payload: message });

  return sendSuccess(res, { message }, "Message sent", 201);
});

/**
 * @swagger
 * /chat/conversations/{conversationId}/upload:
 *   post:
 *     tags: [Chat]
 *     summary: Send a media/file message
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               replyTo: { type: string }
 *     responses:
 *       201:
 *         description: File message sent
 */
const sendFileMessage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);

  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user.id });
  if (!conversation) throw new AppError("Conversation not found", 404);

  const mime = req.file.mimetype;
  let type = "file";
  if (mime.startsWith("image/")) type = "image";
  else if (mime.startsWith("video/")) type = "video";
  else if (mime.startsWith("audio/")) type = "audio";

  const fileUrl = `/uploads/${type}s/${req.file.filename}`;

  const message = await Message.create({
    conversationId,
    sender: req.user.id,
    type,
    fileUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: mime,
    replyTo: req.body.replyTo || null,
  });

  await message.populate("sender", "name avatar");

  conversation.lastMessage = message._id;
  conversation.updatedAt = new Date();
  await conversation.save();

  broadcastToConversation(conversationId, { type: "NEW_MESSAGE", payload: message });

  return sendSuccess(res, { message }, "File sent", 201);
});

/**
 * @swagger
 * /chat/messages/{messageId}:
 *   delete:
 *     tags: [Chat]
 *     summary: Delete a message (soft delete)
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message deleted
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findOne({ _id: req.params.messageId, sender: req.user.id });
  if (!message) throw new AppError("Message not found or unauthorized", 404);

  message.isDeleted = true;
  await message.save();

  broadcastToConversation(message.conversationId.toString(), {
    type: "MESSAGE_DELETED",
    payload: { messageId: message._id, conversationId: message.conversationId },
  });

  return sendSuccess(res, null, "Message deleted");
});

module.exports = {
  getConversations,
  getConversationById,
  startConversation,
  getMessages,
  sendMessage,
  sendFileMessage,
  deleteMessage,
};
