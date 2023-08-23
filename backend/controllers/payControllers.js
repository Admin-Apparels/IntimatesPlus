const User = require("../models/userModel");
const dotenv = require("dotenv");
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
  const userId = req.param.userId;
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

module.exports = { createOrder, updateUser };
