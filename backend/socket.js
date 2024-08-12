const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../backend/models/userModel");
const {
  setUserSocket,
  getUserSocket,
  userSockets,
  onlineUsersMatch,
} = require("./config/socketUtils");
let io;

const initializeSocketIO = (server) => {
  io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
      origin: "/",
    },
  });
  const onlineUsers = new Set();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.exp < Date.now() / 1000) {
        throw new Error("Not authorized, token has expired");
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        throw new Error("User not found");
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error(error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Connected to socket.io");

    const { userId } = socket.handshake.query;

    if (userId) {
      // Update user status to online with the current timestamp
      await User.findByIdAndUpdate(userId, { status: new Date()});
  
      setUserSocket(userId, socket.id); // Ensure this function is defined to manage socket ID
    }

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");

      onlineUsers.add(userData._id);
      io.emit("onlineUsers", Array.from(onlineUsers));

      onlineUsersMatch.add(userData);

      if (userData.isNewUser) {
        io.emit("newUserRegistered", userData);
      }
    });

    socket.on("typing", (senderId) => {
      const receiverSocketId = getUserSocket(senderId); // Get the socket ID of the receiver
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing"); // Emit typing event to the receiver
      }
    });

    socket.on("stop typing", (senderId) => {
      const receiverSocketId = getUserSocket(senderId); // Get the socket ID of the receiver
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop typing"); // Emit stop typing event to the receiver
      }
    });

    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;

        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    socket.on("disconnect", () => {
      onlineUsersMatch.forEach((user) => {
        if (socket.userData && user._id === socket.userData._id) {
          onlineUsersMatch.delete(user);
        }
      });

      if (userSockets.has(userId) && userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
      }

      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers));
      socket.leave(userId);
    });

    socket.on("init", async (data) => {
      const { id } = data;
      if (id) {
        socket.emit("init", { id });
      } else {
        socket.emit("error", { message: "Invalid user ID" });
      }
    });

    socket.on("request", (data) => {
      const receiverId = data.to;
      const receiverSocketId = getUserSocket(receiverId); // Use getUserSocket to get the socket ID of the receiver
      const receiver = io.sockets.connected[receiverSocketId];
      if (receiver && socket.userData) {
        // Check if socket.userData exists
        receiver.emit("request", { from: socket.userData._id });
      }
    });

    socket.on("call", (data) => {
      const receiverId = data.to;
      const receiverSocketId = getUserSocket(receiverId); // Use getUserSocket to get the socket ID of the receiver
      const receiver = io.sockets.connected[receiverSocketId];
      if (receiver) {
        receiver.emit("call", { ...data, from: socket.userData._id });
      } else {
        socket.emit("failed");
      }
    });

    socket.on("call", (data) => {
      const receiverId = data.to;
      const receiverSocketId = getUserSocket(receiverId);
      const receiver = io.sockets.connected[receiverSocketId];
      if (receiver && socket.userData) {
        receiver.emit("call", { ...data, from: socket.userData._id });
      } else {
        socket.emit("failed");
      }
    });
  });

  return io;
};

function getIO() {
  if (!io) {
    throw new Error(
      "Socket.IO is not initialized. Call initializeSocketIO(server) first."
    );
  }
  return io;
}

module.exports = {
  initializeSocketIO,
  getIO,
};
