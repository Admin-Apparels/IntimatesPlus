const { default: axios } = require("axios");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const { getIO } = require("../socket");

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
  const base = "https://api-m.paypal.com";

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

  var Acc;

  var currentDate = new Date();
  var subscriptionExpiry = new Date().getTime();

  if (userAcc === "Bronze") {
    Acc = "Bronze";
  } else if (userAcc === "Platnum") {
    Acc = "Platnum";
    subscriptionExpiry = currentDate.getTime() + 7 * 24 * 60 * 60 * 1000;
  } else {
    Acc = "Gold";
    subscriptionExpiry = currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      accountType: Acc,
      subscription: subscriptionExpiry,
      day: new Date().getTime() + 24 * 60 * 60 * 1000,
    },
    { new: true }
  ).select("accountType subscription day");

  res.json(updatedUser);
};
const makePaymentMpesa = async (req, res) => {
  const { userId } = req.params;
  const { subscription, phoneNumber } = req.body;

  const phone = parseInt(phoneNumber.slice(1));
  const URL = process.env.Callback;

  const current_time = new Date();
  const year = current_time.getFullYear();
  const month = String(current_time.getMonth() + 1).padStart(2, "0");
  const day = String(current_time.getDate()).padStart(2, "0");
  const hours = String(current_time.getHours()).padStart(2, "0");
  const minutes = String(current_time.getMinutes()).padStart(2, "0");
  const seconds = String(current_time.getSeconds()).padStart(2, "0");

  const Shortcode = "6549717";
  const Passkey =
    "9101847e14f66f93ffdec5faeceb315e8918b0bcf4940443dc64b8acd94fd9dd";
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const password = Buffer.from(Shortcode + Passkey + timestamp).toString(
    "base64"
  );

  var Amount;

  if (subscription === "Bronze") {
    Amount = 1;
  } else if (subscription === "Platnum") {
    Amount = 1206;
  } else {
    Amount = 6030;
  }
  const generateToken = async () => {
    const secret = process.env.CUSTOMER_SECRET;
    const key = process.env.CUSTOMER_KEY;
    const auth = Buffer.from(key + ":" + secret).toString("base64");
    try {
      const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      const token = await response.data.access_token;

      return token;
    } catch (error) {
      console.log("Token Error generated", error);
    }
  };

  try {
    const token = await generateToken();

    await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: "6549717",
        Password: `${password}`,
        Timestamp: `${timestamp}`,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: Amount,
        PartyA: `254${phone}`,
        PartyB: "8863150",
        PhoneNumber: `254${phone}`,
        CallBackURL: `${URL}/${userId}/${subscription}`,
        AccountReference: "Admin",
        TransactionDesc: "Subcription",
      },
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.log("My Error", error);
  }
};

const CallBackURL = async (req, res) => {
  const { userId, subscription } = req.params;

  const { Body } = req.body;
  console.log(Body);
  const io = getIO();
  if (!userId && !subscription) {
    console.log("Function returned");
    return res.status(401);
  }
  if (!Body.stkCallback.CallbackMetadata) {
    const nothing = "payment cancelled or insufficient amount";
    io.emit("noPayment", nothing);
    return res.status(201).json({ message: "Invalid callback data" });
  }
  if (Body.stkCallback.ResultDesc) {
    res.status(201);
  }
  const currentDate = new Date();
  var subscriptionExpiry = new Date().getTime();
  if (subscription === "Bronze") {
    Acc = "Bronze";
  } else if (subscription === "Platnum") {
    Acc = "Platnum";
    subscriptionExpiry = currentDate.getTime() + 7 * 24 * 60 * 60 * 1000;
  } else {
    Acc = "Gold";
    subscriptionExpiry = currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        accountType: Acc,
        subscription: subscriptionExpiry,
        day: new Date().getTime() + 24 * 60 * 60 * 1000,
      },
      { new: true }
    ).select("accountType subscription day");

    io.emit("userUpdated", updatedUser);
  } catch (error) {
    console.log(error, "Error updating user");
  }
};

module.exports = {
  createOrder,
  updateUser,
  makePaymentMpesa,
  CallBackURL,
};
