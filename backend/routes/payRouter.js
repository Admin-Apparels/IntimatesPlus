const { protect } = require("../middleware/authMiddleware");
const { createOrder, updateUser } = require("../controllers/payControllers");
const express = require("express");
const router = express.Router();

router.post("/create-paypal-order", protect, createOrder);
router.put("/:userId", protect, updateUser);
module.exports = router;
