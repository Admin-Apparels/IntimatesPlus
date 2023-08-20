const { protect } = require("../middleware/authMiddleware");
const { createOrder } = require("../controllers/payControllers");
const express = require("express");
const router = express.Router();

router.post("/create-paypal-order", protect, createOrder);

module.exports = router;
