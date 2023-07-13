const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const generateToken = require("../config/generateToken");
const registerUsers = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!email || !name || !password) {
    res.status(400);
    throw new Error("Please Enter All fields");
  }
  const userExists = await User.findOne({
    email,
  });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists, login");
  }
  const user = await User.create({ name, email, password, pic });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the account, try again after some time.");
  }
});
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userLog = await User.findOne({ email });

  if (userLog && (await userLog.comparePassword(password))) {
    res.status(201).json({
      _id: userLog._id,
      name: userLog.name,
      email: userLog.email,
      password: userLog.password,
      pic: userLog.pic,
      token: generateToken(userLog._id),
    });
  } else {
    res.status(400);
    throw new Error("User Not Found, Sign Up");
  }
});
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});
const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

const getUsers = asyncHandler(async (req, res) => {
  try {
    const { limit } = req.query;

    const users = await User.aggregate([
      { $sample: { size: parseInt(limit, 10) } },
    ]);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { registerUsers, authUser, allUsers, getUserById, getUsers };
