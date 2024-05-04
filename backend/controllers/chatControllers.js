const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (req, res) => {
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
};
const fetchChats = expressAsyncHandler(async (req, res) => {
  const ADMIN_EMAIL = "admin@fuckmate.boo";
  const ADMIN_CHAT_NAME = "Admin";
  const ADMIN_MESSAGE_CONTENT =
    "👋 Welcome to fuckmate.boo! Exciting news – our algorithm is hard at work, sorting potential matches based on your preferences and location. Share your success stories with us in the future and follow our Twitter Page @fuckmateboo for updates!";
  let adminUser;
  try {
    if (req.user.email === ADMIN_EMAIL) {
      adminUser = await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        {},
        { upsert: true, new: true }
      );

      const adminChat = await Chat.findOneAndUpdate(
        {
          chatName: ADMIN_CHAT_NAME,
          users: { $elemMatch: { $eq: req.user._id } },
        },
        { $addToSet: { users: adminUser._id } },
        { upsert: true, new: true }
      ).populate("users", "-password");

      return res.json(adminChat);
    }

    const userChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .exec();

    if (userChats.length === 0) {
      adminUser = await User.findOne({ email: ADMIN_EMAIL });
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
        { latestMessage: defaultMessage._id },
        { new: true }
      )
        .populate("users", "-password")
        .populate("latestMessage")
        .exec();

      const populatedResults = await User.populate(FullChat, {
        path: "latestMessage.sender",
        select: "name pic email isBlocked",
      });

      return res.json(populatedResults);
    }

    const results = await User.populate(userChats, {
      path: "latestMessage.sender",
      select: "name pic email isBlocked",
    });

    res.status(200).json(results);
  } catch (error) {
    console.log("This is the Error", error);
    res.status(400).json({ error: error.message });
  }
});
const flagChats = async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.user._id;

  try {
    // Find the chat by ID and update its flagged array to include the user's ID
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { flagged: userId } },
      { new: true }
    );

    if (updatedChat) {
      // Fetch the user's chats after the update
      const userChats = await Chat.find({
        users: { $elemMatch: { $eq: req.user._id } },
      })
        .populate("users", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .exec();

      // Populate additional fields as needed
      const populatedResults = await User.populate(userChats, {
        path: "latestMessage.sender",
        select: "name pic email isBlocked",
      });

      // Return the updated user chats with populated fields
      return res.json(populatedResults);
    } else {
      // If the chat is not found, return a 404 error
      return res.status(404).json({ error: "Chat not found" });
    }
  } catch (error) {
    // If an error occurs, log it and return a 500 error
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  flagChats,
};
