const { default: axios } = require("axios");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const { get } = require("mongoose");
dotenv.config({ path: "./secrets.env" });

async function generateAccessToken() {
  const { CLIENT_ID, APP_SECRET } = process.env;
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}
const createOrder = async (req, res) => {
  const { amount } = req.body;
  const base = "https://api-m.sandbox.paypal.com";

  const accessToken = await generateAccessToken();
  const url = `${base.sandbox}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
        },
      ],
    }),
  });
  const data = await response.json();
  res.json(data);
  console.log(data);
};
const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const userAcc = req.query.account;
  console.log(userId, userAcc);

  var Acc;
  const currentDate = new Date();
  var subscriptionExpiry;

  if (userAcc === "Bronze") {
    Acc = "Bronze";
  } else if (userAcc === "Platnum") {
    Acc = "Platnum";
    subscriptionExpiry = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
  } else {
    Acc = "Gold";
    subscriptionExpiry = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { accountType: Acc, subscription: subscriptionExpiry },
    { new: true }
  );

  res.json(updatedUser);
};
const makePaymentMpesa = async (req, res) => {
  const { userId } = req.params;
  const { subscription, phoneNumber } = req.body;

  const phone = phoneNumber.slice(1);

  const current_time = new Date();
  const year = current_time.getFullYear();
  const month = String(current_time.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed
  const day = String(current_time.getDate()).padStart(2, "0");
  const hours = String(current_time.getHours()).padStart(2, "0");
  const minutes = String(current_time.getMinutes()).padStart(2, "0");
  const seconds = String(current_time.getSeconds()).padStart(2, "0");

  const Shortcode = "8799520";
  const Passkey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const password = Buffer.from(Shortcode + Passkey + timestamp).toString(
    "base64"
  );
  var Amount;

  if (subscription === "Bronze") {
    Amount = 150;
  } else if (subscription === "Platnum") {
    Amount = 1000;
  } else {
    Amount = 4000;
  }
  const generateToken = async () => {
    const secret = process.env.CUSTOMER_SECRET;
    const key = process.env.CUSTOMER_KEY;
    const auth = Buffer.from(key + ":" + secret).toString("base64");
    try {
      const response = await fetch(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      const token = await response.data.access_token;
      console.log(token, "generated token Object");

      return token;
    } catch (error) {
      console.log("Token Error generated", error);
    }
  };

  try {
    const token = await generateToken();
    const data = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        body: {
          BusinessShortCode: "8799520",
          Password: `${password}`,
          Timestamp: `${timestamp}`,
          TransactionType: "CustomerBuyGoodsOnline",
          Amount: Amount,
          PartyA: `254${phone}`,
          PartyB: "8799520",
          PhoneNumber: `254${phone}`,
          CallBackURL: `https://localhost:8080/paycheck/${userId}/${subscription}/callback`,
          AccountReference: "Admin",
          TransactionDesc: "Subcription",
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("api to saf", res.json(data), "sent mpesa data");
  } catch (error) {
    console.log("My Error", error);
  }
};
const CallBackURL = async (req, res) => {
  const { userId, subscription } = req.params;
  const { Body } = req.body;
  console.log(
    "This is the body",
    Body,
    "UserId",
    userId,
    "Subcription",
    subscription
  );
  if (!Body.stkCallback.CallbackMetadata) {
    return res.status(400).json({ message: "Invalid callback data" });
  }
  const currentDate = new Date();
  var subscriptionExpiry;
  if (subscription === "Bronze") {
    Acc = "Bronze";
  } else if (subscription === "Platnum") {
    Acc = "Platnum";
    subscriptionExpiry = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
  } else {
    Acc = "Gold";
    subscriptionExpiry = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { accountType: Acc, subscription: subscriptionExpiry },
      { new: true }
    );

    res.json(updatedUser);
    console.log(updateUser);
  } catch (error) {
    console.log(error, "Error updating user");
  }
};

module.exports = { createOrder, updateUser, makePaymentMpesa, CallBackURL };
