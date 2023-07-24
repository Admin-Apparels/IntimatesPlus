const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { FemaleUser, MaleUser } = require("../models/userModel");
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log(decoded);
      if (decoded.gender === "female") {
        req.user = await FemaleUser.findById(decoded.id).select("-password");
      } else if (decoded.gender === "male") {
        req.user = await MaleUser.findById(decoded.id).select("-password");
      } else {
        res.status(401);
        throw new Error("Invalid token, gender not specified");
      }

      next();
    } catch (error) {
      console.error("Error in token verification:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
