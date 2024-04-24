const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../backend/models/userModel");
const { setUserSocket, getUserSocket } = require("./config/socketUtils");
let io;

const initializeSocketIO = (server) => {
  io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
    },
  });
  const onlineUsers = new Set();
  const userStatuses = new Map();

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
    setUserSocket(userId, socket.id);

    socket.on("setup", (userData) => {
      const userId = userData._id;
      socket.join(userId);
      socket.emit("connected");
      socket.userData = userData;
      onlineUsers.add(userId);
      io.emit("onlineUsers", Array.from(onlineUsers));

      if (userData.isNewUser) {
        io.emit("newUserRegistered", userData);
      }
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

    socket.on("disconnect", () => {
      const userId = socket.userData?._id;
      console.log(userId, "disconnected");
      if (socket.userData) {
        io.emit("onlineUsers", Array.from(onlineUsers));
        userStatuses.set(socket.userData?._id, "available");
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
