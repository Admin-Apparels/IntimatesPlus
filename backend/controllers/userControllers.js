const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const generateToken = require("../config/generateToken");
const registerUsers = asyncHandler(async (req, res) => {
  const { name, email, password, gender, pic, value } = req.body;

  if (!email || !name || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists, login");
  }

  const userData = { name, email, password, gender, pic, value };

  const user = await User.create(userData);

  if (user) {
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      value: user.value,
      pic: user.pic,
      token: generateToken(user._id),
    };

    res.status(201).json(responseData);
  } else {
    res.status(400);
    throw new Error("Failed to create the account, try again after some time.");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      value: user.value,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
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
// const randomFemaleUsers = await User.aggregate([
//   { $match: { gender: "female" } },
//   { $sample: { size: 10 } },
// ]);

const getUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({ gender: "female" }).lean();

    res.json({ allUsers });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error404" });
  }
});

module.exports = { registerUsers, authUser, getUserById, getUsers };
