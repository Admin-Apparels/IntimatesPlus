const { protect } = require("../middleware/authMiddleware");
const { limiter } = require("../middleware/limiter");
const express = require("express");
const {
  capturePayment,
  createPaymentOrder,
  voidPayment,
  getUserOrders,
  getAllOrders,
} = require("../controllers/orderController");
const router = express.Router();

router.get("/", protect, limiter, getAllOrders);

router.get("/:userId", protect, limiter, getUserOrders);

router.post("/create-payment-order", protect, limiter, createPaymentOrder);

// router.delete("/delete/:postId", protect, deletePost);
// router.post("/:postId/comments", protect, limiter, postComment);
module.exports = router;
