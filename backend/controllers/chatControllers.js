const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (req, res) => {
  const { userId } = req.body;
  const loggedId = req.user._id;

  if (!userId) {
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: loggedId } } },
      { users: { $elemMatch: { $eq: userId } } },
      { chatName: { $ne: "Admin" } }, // Exclude chats with the name "Admin"
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
  const ADMIN_EMAIL = "intimates_plus@fuckmate.boo";
  const ADMIN_CHAT_NAME = "Admin";
  const ADMIN_MESSAGE_CONTENT =
    "👋 Welcome to IntiMates! Exciting news – our algorithm is hard at work, sorting potential matches based on your preferences and location. Share your success stories with us in the future and follow our Twitter Page @IntiMates_Plus for updates!";

  try {
    // Check if the logged-in user is the admin
    if (req.user.email === ADMIN_EMAIL) {
      // Fetch or create the admin user
      const adminUser = await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        {},
        { upsert: true, new: true }
      );

      // Fetch all users to include in the admin chat
      const users = await User.find({});
      const userIds = users.map((user) => user._id);

      // Fetch or create the admin chat
      let adminChat = await Chat.findOne({ chatName: ADMIN_CHAT_NAME });

      if (!adminChat) {
        adminChat = await Chat.create({
          chatName: ADMIN_CHAT_NAME,
          users: userIds,
        });

        // Create a default welcome message for the admin chat
        const defaultMessageData = {
          sender: adminUser._id,
          content: ADMIN_MESSAGE_CONTENT,
          chat: adminChat._id,
        };

        const defaultMessage = await Message.create(defaultMessageData);

        // Update the admin chat with the latest message
        adminChat.latestMessage = defaultMessage._id;
        await adminChat.save();
      }

      // Populate the admin chat users and latest message
      adminChat = await Chat.findById(adminChat._id)
        .populate({
          path: "users",
          match: { _id: { $in: userIds } },
          select: "-password",
          options: { limit: 2 }, // Limit to admin and one random user
        })
        .populate("latestMessage");

      adminChat = await User.populate(adminChat, {
        path: "latestMessage.sender",
        select: "name pic email isBlocked",
      });

      // Return the admin chat directly for the admin user
      return res.status(200).json([adminChat]);
    }

    // Ensure the user is included in the admin chat if it exists
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    let adminChat = await Chat.findOne({ chatName: ADMIN_CHAT_NAME });

    if (
      adminChat &&
      !adminChat.users.some((user) => user._id.equals(req.user._id))
    ) {
      adminChat.users.push(req.user._id);
      await adminChat.save();
    }

    // Fetch regular user chats
    let userChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .exec();

    userChats = await User.populate(userChats, {
      path: "latestMessage.sender",
      select: "name pic email isBlocked",
    });

    res.status(200).json(userChats);
  } catch (error) {
    console.log("Error occurred:", error);
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
