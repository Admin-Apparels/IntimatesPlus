const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../backend/models/userModel");
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

    // Joining a room for a video call
    socket.on("join room", (roomId) => {
      socket.join(roomId);
      const otherUsers = io.sockets.adapter.rooms.get(roomId);
      if (otherUsers.size > 1) {
        socket.to(roomId).emit("other user", socket.id);
      }
    });

    // Handling signaling data for WebRTC
    socket.on("signal", ({ to, from, signal, room }) => {
      io.to(to).emit("signal", { signal, callerID: from });
    });
    socket.on("initiate call", (recipientId) => {
      const recipientStatus = userStatuses.get(recipientId) || 'available';
      if (recipientStatus === 'busy') {
        socket.emit("user busy", recipientId);
      } else {
        userStatuses.set(recipientId, 'busy'); // Mark recipient as busy
        userStatuses.set(socket.userData._id, 'busy'); // Mark caller as busy
        io.to(recipientId).emit("call initiated", socket.userData._id); // Notify recipient
      }
    });
    
    socket.on("call initiated", (roomId) => {
      io.to(roomId).emit("ringing");
    });

    socket.on("endCall", (roomId) => {
      io.to(roomId).emit("call ended");
      socket.leave(roomId);
    });

    socket.on("disconnect", () => {
      if (socket.userData && socket.userData._id) {
        onlineUsers.delete(socket.userData._id);
        io.emit("onlineUsers", Array.from(onlineUsers));
        userStatuses.set(userId, 'available');
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
