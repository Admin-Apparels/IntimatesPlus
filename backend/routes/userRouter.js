const {
  registerUsers,
  searchUser,
  authUser,
  getUserById,
  getUsers,
  block,
  Unblock,
  updateUser,
  deleteUser,
  deleteImage,
  authorizeUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const { limiter } = require("../middleware/limiter");
const express = require("express");
const router = express.Router();

router.post("/", limiter, registerUsers);
router.get("/:email/:name", limiter, searchUser);
router.route("/login").post(limiter, authUser);
router.get("/:userEmail", limiter, authorizeUser);

router.route("/getusers").get(protect, limiter, getUsers);
router.put("/block/:userId", protect, limiter, block);
router.put("/unblock/:userId", protect, limiter, Unblock);
router.get("/:userId", protect, limiter, getUserById);
router.put("/update/:userId", protect, limiter, updateUser);
router.delete("/deleteuser/:userId", protect, limiter, deleteUser);
router.delete("/delete-image/:publicId", protect, limiter, deleteImage);
module.exports = router;
