const dotenv = require("dotenv");
dotenv.config({ path: "../secrets.env" });
const {
  registerUsers,
  forgotEmail,
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
  recoverEmail,
  getAdsInfo,
  getMail,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const { limiter } = require("../middleware/limiter");
const express = require("express");
const router = express.Router();

router.post("/", limiter, registerUsers);
router.get("/searchuser/:email", limiter, searchUser);
router.get("/account/:email", limiter, forgotEmail);
router.post("/emailrecovery/:email", limiter, recoverEmail);
router.route("/login").post(limiter, authUser);
router.get("/", limiter, authorizeUser);

router.get("/female/users", protect, limiter, getUsers);
router.route("/uniqueness/:email").get(limiter, getMail);
router.put("/block/:userId", protect, limiter, block);
router.put("/unblock/:userId", protect, limiter, Unblock);
router.get("/getuserid/:userId", protect, getUserById);
router.put("/update/:userId", protect, limiter, updateUser);
router.delete("/deleteuser/:userId", protect, limiter, deleteUser);
router.delete("/delete-image/:publicId", protect, limiter, deleteImage);
router.get("/getadsninfo/advertisement", protect, limiter, getAdsInfo);
router.route("/allUsers").get(protect, limiter, allUsers);
module.exports = router;
