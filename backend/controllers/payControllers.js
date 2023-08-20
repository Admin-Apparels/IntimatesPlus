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
module.exports = { createOrder };
