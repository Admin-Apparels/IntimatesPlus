const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");

const createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency,
      payment_method_types: ["card"],
      capture_method: "manual", // Manual to hold funds
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Capture the payment when the date is confirmed
const capturePayment = async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    res.status(200).json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("orderer orderedDate"); // Populate references if needed
    res.json(orders); // Directly return the array of orders
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({
      $or: [
        { orderer: userId }, // Orders the user made
        { orderedDate: userId }, // Orders made for the user
      ],
    })
      .populate("orderedDate")
      .populate("orderer");
    res.json(orders); // Return user's orders
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  capturePayment,
  createPaymentIntent,
  getUserOrders,
  getAllOrders,
};
