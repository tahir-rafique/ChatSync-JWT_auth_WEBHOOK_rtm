const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/userController");

const { protect } = require("../../../middlewares/auth");
const { searchUsersValidator, mongoIdValidator } = require("../../../middlewares/validate");
const upload = require("../../../config/multer");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management & friends
 */

// All routes below require authentication
router.use(protect);

router.get("/", getAllUsers);
router.get("/search", searchUsersValidator, searchUsers);
router.get("/friends", getFriends);
router.get("/friends/requests", getPendingRequests);
router.get("/:userId", mongoIdValidator("userId"), getUserById);
router.put("/profile", upload.single("avatar"), updateProfile);

// Friend request management
router.post("/friends/request/:userId", mongoIdValidator("userId"), sendFriendRequest);
router.post("/friends/accept/:requesterId", mongoIdValidator("requesterId"), acceptFriendRequest);
router.post("/friends/reject/:requesterId", mongoIdValidator("requesterId"), rejectFriendRequest);
router.delete("/friends/:friendId", mongoIdValidator("friendId"), removeFriend);

module.exports = router;
