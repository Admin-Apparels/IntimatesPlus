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
    "Hello from Admin! We aim to respond to your description within 24 hours.";
  try {
    const adminUser = await User.findOneAndUpdate(
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

    if (req.user.email === ADMIN_EMAIL) {
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

module.exports = {
  accessChat,
  fetchChats,
};
