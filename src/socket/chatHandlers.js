const User = require("../models/User");
const { validateToken } = require("../utils/isAuth");

module.exports = (chatNamespace) => {
  const onlineUsers = new Map();

  chatNamespace.use(async (socket, next) => {
    try {
      console.log("Handshake auth:", socket.handshake.auth);
      const token = socket.handshake.auth.token;
      if (!token) {
        console.log("No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      const user = await validateToken(token);
      console.log("Validated user:", user ? user._id : "null");

      if (!user) {
        console.log("Invalid token - no user found");
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.user = user;
      onlineUsers.set(user._id.toString(), socket.id);
      console.log(
        "Added to onlineUsers. Current users:",
        Array.from(onlineUsers.keys())
      );

      await User.findByIdAndUpdate(user._id, { online: true });

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error: " + error.message));
    }
  });

  chatNamespace.on("connection", (socket) => {
    console.log(`Chat connection: ${socket.user.username} (${socket.id})`);
    console.log("Current online users:", Array.from(onlineUsers.keys()));

    socket.broadcast.emit("userOnline", socket.user._id);

    socket.on("getOnlineUsers", (callback) => {
      const onlineUsersList = Array.from(onlineUsers.keys()).map((userId) => ({
        _id: userId,
        username: `User-${userId.substring(0, 4)}`,
      }));
      console.log("Sending online users list:", onlineUsersList);
      callback(onlineUsersList);
    });

    socket.on("sendMessage", ({ recipientId, content }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      console.log(recipientSocketId, content);
      if (recipientSocketId) {
        chatNamespace.to(recipientSocketId).emit("receiveMessage", {
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
      console.log(
        `User ${userId} disconnected. Remaining users:`,
        Array.from(onlineUsers.keys())
      );
      await User.findByIdAndUpdate(userId, { online: false });
      socket.broadcast.emit("userOffline", userId);
      console.log(`Chat disconnected: ${socket.user.username} (${socket.id})`);
    });
  });

  // Debug helper to periodically log online users
  setInterval(() => {
    console.log(
      "Current onlineUsers state:",
      Array.from(onlineUsers.entries())
    );
  }, 10000);

  return {
    // Expose methods for testing/debugging
    getOnlineUsers: () => Array.from(onlineUsers.entries()),
    getUserSocketId: (userId) => onlineUsers.get(userId),
  };
};
