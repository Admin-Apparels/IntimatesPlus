const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
} = require("../controllers/messageControlllers");
const { protect } = require("../middleware/authMiddleware");
const { limiter } = require("../middleware/limiter");

const router = express.Router();

router.route("/:chatId").get(protect, limiter, allMessages);
router.route("/:messageId").delete(protect, limiter, deleteMessage);
router.route("/").post(protect, limiter, sendMessage);

module.exports = router;
