const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../backend/models/userModel");
const { getUserIdFromToken } = require("./middleware/authMiddleware");
const {
  setUserSocket,
  getUserSocket,
  createRoomId,
} = require("./config/socketUtils");
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

  io.on("connection", (socket) => {
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

    socket.on("join room", (roomId) => {
      socket.join(roomId);
      const otherUsers = io.sockets.adapter.rooms.get(roomId);
      if (otherUsers.size > 1) {
        socket
          .to(roomId)
          .emit("other user", { otherUserId: socket.id, roomId });
      }
    });

    socket.on("signal", ({ to, from, signal, room }) => {
      io.to(to).emit("signal", { signal, callerID: from });
    });
    socket.on("initiate call", ({ callerId, recipientId }) => {
      console.log("Call initiation listener", recipientId);
      const recipientStatus = userStatuses.get(recipientId) || "available";
      if (recipientStatus === "busy") {
        socket.emit("user busy", recipientId);
      } else {
        userStatuses.set(recipientId, "busy"); // Mark recipient as busy
        userStatuses.set(callerId, "busy"); // Mark caller as busy
        const roomId = createRoomId(callerId, recipientId); // Create a unique room ID

        // Store the recipient's socket ID or user ID for later use
        const recipientSocketId = getUserSocket(recipientId);
        console.log(recipientSocketId); // Implement this function to get the recipient's socket ID

        if (recipientSocketId) {
          io.to(recipientSocketId).emit("call initiated", roomId);
          console.log("sending a signal");
        } else {
          socket.emit("recipient unavailable", recipientId);
        }
      }
    });

    socket.on("endCall", (roomId) => {
      io.to(roomId).emit("call ended");

      // Get the list of sockets in the room
      const roomSockets = io.sockets.adapter.rooms.get(roomId);

      if (roomSockets && roomSockets.size > 0) {
        // Iterate over the sockets in the room and make them leave
        roomSockets.forEach((socketId) => {
          io.sockets.sockets[socketId].leave(roomId);
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userData) {
        io.emit("onlineUsers", Array.from(onlineUsers));
        userStatuses.set(socket.userData?._id, "available");
      }
    });
    userStatuses.delete(socket.userData?._id);
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
