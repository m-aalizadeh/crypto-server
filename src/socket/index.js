const socketIO = require("socket.io");

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  const chatNamespace = io.of("/chat");
  const cryptoNamespace = io.of("/crypto");

  require("./chatHandlers")(chatNamespace);
  require("./cryptoHandlers")(cryptoNamespace);

  return io;
};
