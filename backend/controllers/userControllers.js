const asyncHandler = require("express-async-handler");
const { FemaleUser, MaleUser } = require("../models/userModel");

const generateToken = require("../config/generateToken");
const registerUsers = asyncHandler(async (req, res) => {
  const { name, email, password, gender, pic, value } = req.body;
  console.log(gender);

  if (!email || !name || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  let User;
  if (gender === "female") {
    User = FemaleUser;
  } else if (gender === "male") {
    User = MaleUser;
  } else {
    res.status(400);
    throw new Error("Invalid gender");
  }

  // Check if user already exists in the corresponding collection
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists, login");
  }

  const userData = { name, email, password, gender, pic };

  if (gender === "female") {
    userData.value = value; // Add value field only for female users
  }

  // Create a new user based on gender
  const user = await User.create(userData);

  if (user) {
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      pic: user.pic,
      token: generateToken(user._id, user.gender),
    };

    res.status(201).json(responseData);
  } else {
    res.status(400);
    throw new Error("Failed to create the account, try again after some time.");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const femaleUser = await FemaleUser.findOne({ email });

  const maleUser = !femaleUser ? await MaleUser.findOne({ email }) : null;

  if (femaleUser && (await femaleUser.comparePassword(password))) {
    res.status(201).json({
      _id: femaleUser._id,
      name: femaleUser.name,
      email: femaleUser.email,
      gender: femaleUser.gender,
      pic: femaleUser.pic,
      token: generateToken(femaleUser._id, femaleUser.gender),
    });
  } else if (maleUser && (await maleUser.comparePassword(password))) {
    res.status(201).json({
      _id: maleUser._id,
      name: maleUser.name,
      email: maleUser.email,
      gender: maleUser.gender,
      pic: maleUser.pic,
      token: generateToken(maleUser._id, maleUser.gender),
    });
  } else {
    res.status(400);
    throw new Error("User Not Found, Sign Up");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  // const keyword = req.query.search
  //   ? {
  //       $or: [
  //         { name: { $regex: req.query.search, $options: "i" } },
  //         { email: { $regex: req.query.search, $options: "i" } },
  //       ],
  //     }
  //   : {};
  // const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  // res.send(users);
});
const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const femaleUser = await FemaleUser.findById(userId);
    const maleUser = !femaleUser ? await MaleUser.findById(userId) : null;
    if (femaleUser) {
      res.json({ femaleUser });
    } else {
      res.json({ maleUser });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

const getUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await FemaleUser.find().lean().exec();
    console.log(allUsers);

    res.json({ allUsers });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { registerUsers, authUser, allUsers, getUserById, getUsers };
