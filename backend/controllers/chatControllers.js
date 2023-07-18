const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const { FemaleUser, MaleUser } = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId, user } = req.body;
  if (!userId) {
    return res.sendStatus(400);
  }

  // Determine the type of user based on the gender field
  let User;
  if (user.gender === "female") {
    User = FemaleUser;
  } else {
    User = MaleUser;
  }

  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      users: [user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const gender = req.user.gender;
    console.log(userId, gender);

    let UserModel;
    if (gender === "female") {
      UserModel = FemaleUser;
    } else if (gender === "male") {
      UserModel = MaleUser;
    } else {
      res.status(400);
      throw new Error("Invalid gender");
    }

    const results = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await UserModel.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.status(200).json(populatedResults);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { accessChat, fetchChats };
