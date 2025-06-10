const socketIO = require("socket.io");

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  require("./handlers")(io);

  return io;
};
