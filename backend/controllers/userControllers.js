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
      isBlocked: [],
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
      isBlocked: user.isBlocked,
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
const block = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = req.user;
  try {
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { isBlocked: userId } }
    );
    const updatedUser = await User.findById(user._id).select("isBlocked");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to Block!" });
  }
});
const Unblock = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = req.user;

  try {
    await User.updateOne({ _id: user._id }, { $pull: { isBlocked: userId } });

    const updatedUser = await User.findById(user._id).select("isBlocked");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Unable to Unblock" });
  }
});
const updateUser = async (req, res) => {
  const { pic } = req.body;
  const { userId } = req.params;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { pic: pic },
      { new: true }
    ).select("pic");

    res.json(updatedUser);
  } catch (error) {
    throw new Error("Failed to update user pic");
  }
};
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    const deletedUser = await User.findOneAndDelete({ _id: userId });
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerUsers,
  authUser,
  getUserById,
  getUsers,
  block,
  Unblock,
  updateUser,
  deleteUser,
};
