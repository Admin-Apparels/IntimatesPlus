const socketIO = require("socket.io");

let io;

const initializeSocketIO = (server) => {
  io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
    },
  });

  const onlineUsers = new Set();

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      const userId = userData._id;
      socket.join(userId);
      socket.emit("connected");
      socket.userData = userData;
      onlineUsers.add(userId);
      io.emit("onlineUsers", onlineUsers.size);

      if (userData.isNewUser) {
        io.emit("newUserRegistered", userData);
      }
    });

    socket.on("join chat", (room) => {
      socket.join(room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;

        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    socket.on("disconnect", () => {
      if (socket.userData && socket.userData._id) {
        const userId = socket.userData._id;
        onlineUsers.delete(userId);
        io.emit("onlineUsers", onlineUsers.size);
      }
    });
    socket.off("setup", () => {
      socket.leave(userData._id);
    });
    return io;
  });
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
