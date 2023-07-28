const {
  registerUsers,
  authUser,
  getUserById,
  getUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

router.post("/", registerUsers);
router.route("/login").post(authUser);

router.route("/").get(protect, getUsers);
router.get("/:userId", protect, getUserById);
module.exports = router;
