const {
  registerUsers,
  authUser,
  getUserById,
  getUsers,
  block,
  Unblock,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

router.post("/", registerUsers);
router.route("/login").post(authUser);

router.route("/").get(protect, getUsers);
router.put("/block/:userId", protect, block);
router.put("/unblock/:userId", protect, Unblock);
router.get("/:userId", protect, getUserById);
module.exports = router;
