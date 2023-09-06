const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  updateUser,
  makePaymentMpesa,
} = require("../controllers/payControllers");
const express = require("express");
const router = express.Router();

router.post("/create-paypal-order", protect, createOrder);
router.put("/:userId", protect, updateUser);
router.post("/makepaymentmpesa/:userId", protect, makePaymentMpesa);
module.exports = router;
