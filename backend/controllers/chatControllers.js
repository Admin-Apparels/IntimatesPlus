const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const { FemaleUser, MaleUser } = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = async (req, res) => {
  const { userId, user } = req.body;
  console.log(userId);
  console.log(user);
  if (!userId) {
    return res.sendStatus(400);
  }

 
  let User;
  if (user.gender === "female") {
    User = FemaleUser;
    console.log(" User is female");
  } else {
    User = MaleUser;
    console.log("User is male")
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
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
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      console.log(createdChat);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      res.status(400).json({ message: error.message });
      console.log("catch block run")
    }
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = async (req, res) => {
  try {
    const {user} = req.body;
    console.log(user._id, user.gender);

    let UserModel;
    if (user.gender === "female") {
      UserModel = FemaleUser;
    } else if (user.gender === "male") {
      UserModel = MaleUser;
    } else {
      res.status(400);
      throw new Error("Invalid gender");
    }

    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await UserModel.populate(results, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      res.status(200).send(results);
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { accessChat, fetchChats };
