const Order = require("../models/orderModel");
const paypal = require("@paypal/checkout-server-sdk");

const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

const createPaymentOrder = async (req, res) => {
  const { amount, currency } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "AUTHORIZE", // Use AUTHORIZE to capture later
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount, // Amount in regular units (not cents)
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ orderID: order.result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const capturePayment = async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.status(200).json(capture.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const voidPayment = async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersVoidRequest(orderID);

  try {
    const voided = await client.execute(request);
    res.status(200).json(voided.result);
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

module.exports = {
  capturePayment,
  createPaymentOrder,
  voidPayment,
  getUserOrders,
  getAllOrders,
};
