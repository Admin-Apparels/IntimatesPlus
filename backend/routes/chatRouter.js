const express = require("express");
const {
  accessChat,
  fetchChats,
  flagChats,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");
const { limiter } = require("../middleware/limiter");

const router = express.Router();

router.route("/").post(protect, limiter, accessChat);
router.route("/").get(protect, limiter, fetchChats);
router.route("/flag/:chatId").put(protect, limiter, flagChats);

module.exports = router;
