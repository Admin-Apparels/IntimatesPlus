const jwt = require("jsonwebtoken");
const generateToken = (id, gender) => {
  return jwt.sign({ id, gender }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
module.exports = generateToken;
