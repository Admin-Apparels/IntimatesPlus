const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { accounttype } = req.params;
  const { userId } = req.body;
  const loggedId = req.user._id;

  if (accounttype === "platnum") {
    try {
      const time = new Date().getTime() + 24 * 60 * 60 * 1000;
      const timeOfChat = await User.findByIdAndUpdate(loggedId, {
        day: time,
      });
      console.log(timeOfChat);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: loggedId } } },
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

      users: [loggedId, userId],
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
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .exec();

    if (results.length === 0) {
      return res.status(200).json({ message: "No chats found." });
    }

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email isBlocked",
    });

    res.status(200).json(populatedResults);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = {
  accessChat,
  fetchChats,
};
