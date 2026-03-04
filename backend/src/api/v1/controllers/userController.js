const User = require("../../../models/User");
const AppError = require("../../../utils/AppError");
const asyncHandler = require("../../../utils/asyncHandler");
const { sendSuccess, sendPaginated } = require("../../../utils/response");

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users by email
 *     parameters:
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *         description: Email to search (partial match)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of users
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q = "", page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    _id: { $ne: req.user.id }
  };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("name email avatar isOnline lastSeen")
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  // Annotate with friendship status
  const currentUser = await User.findById(req.user.id).select("friends friendRequests");
  const friendIds = currentUser.friends.map((f) => f.toString());
  const pendingIds = currentUser.friendRequests
    .filter((r) => r.status === "pending")
    .map((r) => r.from.toString());

  const annotated = users.map((u) => ({
    ...u,
    isFriend: friendIds.includes(u._id.toString()),
    isPending: pendingIds.includes(u._id.toString()),
  }));

  return sendPaginated(res, annotated, total, parseInt(page), parseInt(limit), "Users fetched");
});

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User data
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("-password -refreshToken -resetPasswordToken -resetPasswordExpires");
  if (!user) throw new AppError("User not found", 404);
  return sendSuccess(res, { user }, "User fetched");
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update current user's profile
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Profile updated
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (req.file) updates.avatar = `/uploads/images/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  return sendSuccess(res, { user: user.toPublic() }, "Profile updated");
});

/**
 * @swagger
 * /users/friends:
 *   get:
 *     tags: [Users]
 *     summary: Get current user's friends list
 *     responses:
 *       200:
 *         description: Friends list
 */
const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "friends",
    "name email avatar isOnline lastSeen"
  );
  return sendSuccess(res, { friends: user.friends }, "Friends fetched");
});

/**
 * @swagger
 * /users/friends/request/{userId}:
 *   post:
 *     tags: [Users]
 *     summary: Send a friend request
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend request sent
 */
const sendFriendRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.id) throw new AppError("Cannot add yourself", 400);

  const target = await User.findById(userId);
  if (!target) throw new AppError("User not found", 404);

  const alreadyFriends = target.friends.includes(req.user.id);
  if (alreadyFriends) throw new AppError("Already friends", 400);

  const alreadyPending = target.friendRequests.some(
    (r) => r.from.toString() === req.user.id && r.status === "pending"
  );
  if (alreadyPending) throw new AppError("Friend request already sent", 400);

  target.friendRequests.push({ from: req.user.id, status: "pending" });
  await target.save();

  return sendSuccess(res, null, "Friend request sent");
});

/**
 * @swagger
 * /users/friends/accept/{requesterId}:
 *   post:
 *     tags: [Users]
 *     summary: Accept a friend request
 *     parameters:
 *       - in: path
 *         name: requesterId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend request accepted
 */
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requesterId } = req.params;
  const user = await User.findById(req.user.id);

  const reqIndex = user.friendRequests.findIndex(
    (r) => r.from.toString() === requesterId && r.status === "pending"
  );
  if (reqIndex === -1) throw new AppError("Friend request not found", 404);

  user.friendRequests[reqIndex].status = "accepted";
  user.friends.push(requesterId);
  await user.save();

  // Add reverse friendship
  await User.findByIdAndUpdate(requesterId, { $addToSet: { friends: req.user.id } });

  return sendSuccess(res, null, "Friend request accepted");
});

/**
 * @swagger
 * /users/friends/reject/{requesterId}:
 *   post:
 *     tags: [Users]
 *     summary: Reject a friend request
 *     parameters:
 *       - in: path
 *         name: requesterId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend request rejected
 */
const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requesterId } = req.params;
  const user = await User.findById(req.user.id);

  const reqIndex = user.friendRequests.findIndex(
    (r) => r.from.toString() === requesterId && r.status === "pending"
  );
  if (reqIndex === -1) throw new AppError("Friend request not found", 404);

  user.friendRequests[reqIndex].status = "rejected";
  await user.save();

  return sendSuccess(res, null, "Friend request rejected");
});

/**
 * @swagger
 * /users/friends/{friendId}:
 *   delete:
 *     tags: [Users]
 *     summary: Remove a friend
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Friend removed
 */
const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.params;
  await User.findByIdAndUpdate(req.user.id, { $pull: { friends: friendId } });
  await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user.id } });
  return sendSuccess(res, null, "Friend removed");
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all registered users (except current)
 *     responses:
 *       200:
 *         description: List of users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } })
    .select("name email avatar isOnline lastSeen")
    .lean();

  return sendSuccess(res, { users }, "All users fetched");
});

/**
 * @swagger
 * /users/friends/requests:
 *   get:
 *     tags: [Users]
 *     summary: Get pending friend requests
 *     responses:
 *       200:
 *         description: List of pending requests
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "friendRequests.from",
    "name email avatar"
  );

  const pending = user.friendRequests.filter(r => r.status === "pending");
  return sendSuccess(res, { requests: pending }, "Pending requests fetched");
});

module.exports = {
  searchUsers,
  getAllUsers,
  getPendingRequests,
  getUserById,
  updateProfile,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
};
