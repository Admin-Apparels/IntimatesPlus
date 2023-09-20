const express = require("express");
const { accessChat, fetchChats } = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");
const { limiter } = require("../middleware/limiter");

const router = express.Router();

router.route("/").post(protect, limiter, accessChat);
router.route("/").get(protect, limiter, fetchChats);

module.exports = router;
