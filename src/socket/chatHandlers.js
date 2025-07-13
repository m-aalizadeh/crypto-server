const User = require("../models/User");
const { validateToken } = require("../utils/isAuth");

module.exports = (chatNamespace) => {
  const onlineUsers = new Map();

  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const user = await validateToken(token);

      if (!user) {
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.user = user;
      onlineUsers.set(user._id.toString(), {
        socketId: socket.id,
        username: user.username,
      });
      await User.findByIdAndUpdate(user._id, { online: true });

      next();
    } catch (error) {
      next(new Error("Authentication error: " + error.message));
    }
  });

  chatNamespace.on("connection", (socket) => {
    console.log(`Chat connection: ${socket.user.username} (${socket.id})`);

    socket.broadcast.emit("userOnline", {
      userId: socket.user._id,
      username: socket.user.username,
    });

    socket.on("getOnlineUsers", (callback) => {
      const onlineUsersList = [];
      onlineUsers.forEach((value, key) => {
        onlineUsersList.push({ _id: key, username: value.username });
      });
      callback(onlineUsersList);
    });

    socket.on("sendMessage", ({ recipientId, content }) => {
      const recipientSocket = onlineUsers.get(recipientId);
      console.log("recipientSocketId", onlineUsers.get(recipientId));
      if (recipientSocket.socketId) {
        chatNamespace.to(recipientSocket.socketId).emit("receiveMessage", {
          sender: socket.user._id,
          content,
          timestamp: new Date(),
        });
      } else {
        console.log("Recipient not found in onlineUsers");
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.user._id.toString();
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false });
      socket.broadcast.emit("userOffline", userId);
      console.log(`Chat disconnected: ${socket.user.username} (${socket.id})`);
    });
  });

  return {
    getOnlineUsers: () => Array.from(onlineUsers.entries()),
    getUserSocketId: (userId) => onlineUsers.get(userId),
  };
};
