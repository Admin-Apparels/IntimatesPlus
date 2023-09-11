const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  updateUser,
  makePaymentMpesa,
  CallBackURL,
} = require("../controllers/payControllers");
const express = require("express");
const router = express.Router();

router.post("/create-paypal-order", protect, createOrder);
router.put("/:userId", protect, updateUser);
router.post("/makepaymentmpesa/:userId", protect, makePaymentMpesa);
router.get("/:userId/:subscription/callback", protect, CallBackURL);
module.exports = router;
