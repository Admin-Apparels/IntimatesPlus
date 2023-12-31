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
    socket.on("callUser", ({ offer, to }) => {
      io.to(to).emit("callMade", {
        offer,
        caller: socket.id,
      });
    });

    socket.on("makeAnswer", ({ to, answer }) => {
      io.to(to).emit("answerMade", {
        socket: socket.id,
        answer,
      });
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      io.to(to).emit("iceCandidateReceived", {
        socket: socket.id,
        candidate,
      });
    });
    socket.on("call initiated", (roomId) => {
      // Emit 'ringing' to the room when a call is initiated
      io.to(roomId).emit("ringing");
    });
    socket.on("call answered", (roomId) => {
      // Emit 'connecting' when the call is being answered
      io.to(roomId).emit("connecting");
    });

    socket.on("call ended", (roomId) => {
      // Emit 'call ended' to the room when a call is ended
      io.to(roomId).emit("call ended");
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
