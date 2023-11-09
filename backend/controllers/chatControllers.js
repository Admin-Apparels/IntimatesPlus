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

  if (accounttype && accounttype === "Platnum") {
    try {
      const time = new Date().getTime() + 24 * 60 * 60 * 1000;
      const timeOfChat = await User.findByIdAndUpdate(
        loggedId,
        {
          day: time,
        },
        { new: true }
      ).select("day");
      res.json(timeOfChat);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
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
      res.json(FullChat);
    } catch (error) {
      res.status(400);
    }
  }
});
const fetchChats = asyncHandler(async (req, res) => {
  const ADMIN_EMAIL = "jngatia045@gmail.com";
  const ADMIN_CHAT_NAME = "Admin";
  const ADMIN_MESSAGE_CONTENT = "Hello from Admin!";
  try {
    const userChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    });

    if (!userChats || userChats.length === 0) {
      const adminUser = await User.findOne({ email: ADMIN_EMAIL });

      if (req.user.gender === "female" && adminUser) {
        const defaultChatData = {
          chatName: ADMIN_CHAT_NAME,
          users: [req.user._id, adminUser._id],
        };

        const defaultChat = await Chat.create(defaultChatData);

        const defaultMessageData = {
          sender: adminUser._id,
          content: ADMIN_MESSAGE_CONTENT,
          chat: defaultChat._id,
        };
        const defaultMessage = await Message.create(defaultMessageData);

        const FullChat = await Chat.findByIdAndUpdate(
          defaultChat._id,
          {
            latestMessage: defaultMessage._id,
          },
          { new: true }
        );

        return res.status(200).json(FullChat);
      }
    }
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
