const http = require("http");
const app = require("./app");
const setupSocket = require("./src/socket");

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => console.log("Server is running on port %d", PORT));
