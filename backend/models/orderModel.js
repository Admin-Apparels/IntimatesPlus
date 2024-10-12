const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderedDate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "disputed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  paymentId: { type: String }, // Reference to payment from the gateway
  escrow: { type: Boolean, default: true }, // Indicate whether the funds are held in escrow
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
