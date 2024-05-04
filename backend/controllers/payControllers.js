const { default: axios } = require("axios");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const { getIO } = require("../socket");
const Chat = require("../models/chatModel");

dotenv.config({ path: "./secrets.env" });

let userId;
let subscription;

async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    "base64"
  );
  const base = "https://api-m.paypal.com";
  try {
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!response.ok) {
      throw new Error("Failed to generate access token");
    }
    const jsonData = await response.json();
    return jsonData.access_token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
}

const createOrder = async (req, res) => {
  const { amount } = req.body;
  try {
    const accessToken = await generateAccessToken();
    const base = "https://api-m.paypal.com";
    const url = `${base}/v2/checkout/orders`;
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
    if (!response.ok) {
      throw new Error("Failed to create order");
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const userAcc = req.query.accountType;
  const type = req.params.type;
  const io = getIO();

  var Acc;

  var currentDate = new Date();
  var subscriptionExpiry = new Date().getTime();

  if (type === "Ads") {
    subscriptionExpiry = currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          adsSubscription: subscriptionExpiry,
        },
        { new: true }
      ).select("adsSubscription");
      io.emit("noMoreAds", updatedUser);
    } catch (error) {
      console.log(error);
    }
    return;
  } else if (type === "femaleSub") {
    subscriptionExpiry = currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          subscription: subscriptionExpiry,
        },
        { new: true }
      ).select("subscription");
      io.emit("premium", updatedUser);
    } catch (error) {
      console.log(error);
    }
    return;
  } else if (userAcc === "Bronze") {
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

  // Unflag all the flagged chats for the user and populate them
  const Chats = await Chat.updateMany(
    { flagged: userId }, // Find chats where the user is flagged
    { $pull: { flagged: userId } } // Remove the user's ID from the flagged array
  ).populate({
    path: "users latestMessage", // Populate the users and latestMessage fields
    populate: { path: "sender", select: "name" }, // Populate the sender field of latestMessage
  });

  // Emit the updated user data and populated chats to the client
  io.emit("userUpdated", updatedUser, Chats);

  res.json(updatedUser);
};
const makePaymentMpesa = async (req, res) => {
  userId = req.params.userId;
  subscription = req.body.subscription;
  const phoneNumber = req.body.phoneNumber;

  const phone = parseInt(phoneNumber.slice(1));

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
    Amount = 200;
  } else if (subscription === "Platnum") {
    Amount = 550;
  } else if (subscription === "Gold") {
    Amount = 1800;
  } else if (subscription === "premium") {
    Amount = 500;
  } else {
    Amount = 300;
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

    const { data } = await axios.post(
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
        CallBackURL: `https://fuckmate.boo/api/paycheck/callback`,
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
    res.json(data);
  } catch (error) {
    console.log("My Error", error);
  }
};

const CallBackURL = async (req, res) => {
  const { Body } = req.body;

  const io = getIO();

  if (!userId && !subscription) {
    return res.status(401);
  }
  if (
    !Body.stkCallback.CallbackMetadata ||
    Body.stkCallback.CallbackMetadata === undefined
  ) {
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
  } else if (subscription === "Ads") {
    subscriptionExpiry = currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          adsSubscription: subscriptionExpiry,
        },
        { new: true }
      ).select("adsSubscription");
      io.emit("noMoreAds", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.log(error);
    }
    return;
  } else if (subscription === "premium") {
    subscriptionExpiry = currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          subscription: subscriptionExpiry,
        },
        { new: true }
      ).select("subscription");

      io.emit("premium", updatedUser);
    } catch (error) {
      console.log(error, "Error updating user");
    }
    return;
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
    // Unflag all the flagged chats for the user and populate them
    const Chats = await Chat.updateMany(
      { flagged: userId }, // Find chats where the user is flagged
      { $pull: { flagged: userId } } // Remove the user's ID from the flagged array
    ).populate({
      path: "users latestMessage", // Populate the users and latestMessage fields
      populate: { path: "sender", select: "name" }, // Populate the sender field of latestMessage
    });

    // Emit the updated user data and populated chats to the client
    io.emit("userUpdated", updatedUser, Chats);
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
